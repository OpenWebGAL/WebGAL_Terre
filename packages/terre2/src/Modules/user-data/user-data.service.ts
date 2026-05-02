import { ConsoleLogger, Injectable } from '@nestjs/common';
import * as fs from 'fs/promises';
import * as os from 'os';
import * as path from 'path';
import { _open } from '../../util/open';
import {
  UserDataLegacyMigrationStatusDto,
  UserDataOperationResultDto,
  UserDataStatusDto,
} from './user-data.dto';

interface UserDataConfig {
  version: number;
  userDataPath?: string;
}

interface UserDataState {
  appRoot: string;
  configRoot: string;
  configPath: string;
  defaultUserDataRoot: string;
  configuredUserDataRoot: string;
  activeUserDataRoot: string;
  portableDataRoot: string;
  isPortable: boolean;
  hasPortableDataDir: boolean;
  config: UserDataConfig;
}

interface MoveResult {
  moved: string[];
  conflicts: string[];
}

const USER_DATA_DIR_NAME = '.webgal_terre';
const CONFIG_FILE_NAME = 'config.json';
const CONFIG_VERSION = 1;
const PORTABLE_DATA_DIR_NAME = 'data';
const BUILT_IN_TEMPLATE_DIRS = new Set(['WebGAL_Classic', 'WebGAL Black']);
const MANAGED_DATA_DIRS = [
  'games',
  'templates',
  'derivative-engines',
  'Exported_Games',
];

@Injectable()
export class UserDataService {
  private static state: UserDataState | null = null;
  private static logger = new ConsoleLogger('UserDataService');

  constructor(private readonly logger: ConsoleLogger) {
    UserDataService.logger = logger;
  }

  static async initialize() {
    const state = await this.createState();
    this.state = state;
    await this.ensureStateDirectories();
    await this.saveConfig(state.config);
  }

  static getState(): UserDataState {
    if (!this.state) {
      throw new Error('UserDataService has not been initialized.');
    }
    return this.state;
  }

  private static getOptionalState(): UserDataState | null {
    return this.state;
  }

  static getInstallPath(rawPath = '') {
    return this.safeResolve(process.cwd(), rawPath);
  }

  static getGameRoot(gameName?: string) {
    const base = path.join(this.getState().activeUserDataRoot, 'games');
    return gameName ? this.safeResolve(base, gameName) : base;
  }

  static getTemplateRoot(templateName?: string, preferUser = false) {
    const userRoot = path.join(this.getState().activeUserDataRoot, 'templates');
    if (!templateName) return userRoot;

    const userPath = this.safeResolve(userRoot, templateName);
    if (preferUser) return userPath;

    const installPath = this.safeResolve(
      this.getInstallPath('public/templates'),
      templateName,
    );
    return this.existsSync(userPath) || !this.existsSync(installPath)
      ? userPath
      : installPath;
  }

  static getUserTemplateRoot(templateName?: string) {
    return this.getTemplateRoot(templateName, true);
  }

  static getDerivativeEngineRoot(engineName?: string) {
    const base = path.join(
      this.getState().activeUserDataRoot,
      'derivative-engines',
    );
    return engineName ? this.safeResolve(base, engineName) : base;
  }

  static getExportRoot(gameName?: string) {
    const base = path.join(this.getState().activeUserDataRoot, 'Exported_Games');
    return gameName ? this.safeResolve(base, gameName) : base;
  }

  static getEngineTemplateRoot(rawPath = '') {
    return this.safeResolve(
      this.getInstallPath('assets/templates/WebGAL_Template'),
      rawPath,
    );
  }

  static getDefaultTemplateRoot(rawPath = '') {
    return this.safeResolve(
      this.getInstallPath('assets/templates/WebGAL_Default_Template'),
      rawPath,
    );
  }

  static isPathInsideAllowedRoots(pathToCheck: string): boolean {
    const state = this.getOptionalState();
    if (!state) {
      return this.isPathInside(process.cwd(), pathToCheck);
    }
    return [
      state.appRoot,
      state.activeUserDataRoot,
      state.configRoot,
      state.portableDataRoot,
      state.defaultUserDataRoot,
      state.configuredUserDataRoot,
    ].some((root) => this.isPathInside(root, pathToCheck));
  }

  static resolveLogicalPath(rawPath: string) {
    const decodedPath = decodeURI(rawPath).replace(/\\/g, '/');
    const normalizedPath = decodedPath.replace(/^\/+/, '').replace(/\/+$/, '');
    const state = this.getOptionalState();
    if (!state) return this.safeResolve(process.cwd(), normalizedPath);

    if (normalizedPath === 'public') return state.activeUserDataRoot;
    if (normalizedPath === 'public/games' || normalizedPath === 'games') {
      return this.getGameRoot();
    }
    if (normalizedPath.startsWith('public/games/')) {
      return this.safeResolve(
        this.getGameRoot(),
        normalizedPath.slice('public/games/'.length),
      );
    }
    if (normalizedPath.startsWith('games/')) {
      return this.safeResolve(
        this.getGameRoot(),
        normalizedPath.slice('games/'.length),
      );
    }

    if (normalizedPath === 'public/templates' || normalizedPath === 'templates') {
      return this.getUserTemplateRoot();
    }
    if (normalizedPath.startsWith('public/templates/')) {
      return this.resolveTemplateLogicalPath(
        normalizedPath.slice('public/templates/'.length),
      );
    }
    if (normalizedPath.startsWith('templates/')) {
      return this.resolveTemplateLogicalPath(
        normalizedPath.slice('templates/'.length),
      );
    }

    if (
      normalizedPath === 'assets/templates/Derivative_Engine' ||
      normalizedPath === 'assets/templates/Derivative_Engine/'
    ) {
      return this.getDerivativeEngineRoot();
    }
    if (normalizedPath.startsWith('assets/templates/Derivative_Engine/')) {
      return this.safeResolve(
        this.getDerivativeEngineRoot(),
        normalizedPath.slice('assets/templates/Derivative_Engine/'.length),
      );
    }

    if (
      normalizedPath === 'Exported_Games' ||
      normalizedPath.startsWith('Exported_Games/')
    ) {
      return this.safeResolve(
        state.activeUserDataRoot,
        normalizedPath,
      );
    }

    return this.safeResolve(process.cwd(), normalizedPath);
  }

  static async resolveReadableTemplateFile(templateName: string, filePath = '') {
    const userPath = this.safeResolve(
      this.getUserTemplateRoot(templateName),
      filePath,
    );
    if (await this.pathExists(userPath)) return userPath;
    const installPath = this.safeResolve(
      this.getInstallPath(`public/templates/${templateName}`),
      filePath,
    );
    if (await this.pathExists(installPath)) return installPath;
    return userPath;
  }

  static async getStatus(): Promise<UserDataStatusDto> {
    const state = this.getState();
    state.hasPortableDataDir = await this.pathIsDir(state.portableDataRoot);
    state.isPortable = state.hasPortableDataDir;
    state.activeUserDataRoot = state.isPortable
      ? state.portableDataRoot
      : state.configuredUserDataRoot;
    await this.ensureStateDirectories();

    return {
      appRoot: state.appRoot,
      configRoot: state.configRoot,
      configPath: state.configPath,
      defaultUserDataRoot: state.defaultUserDataRoot,
      configuredUserDataRoot: state.configuredUserDataRoot,
      activeUserDataRoot: state.activeUserDataRoot,
      portableDataRoot: state.portableDataRoot,
      isPortable: state.isPortable,
      hasPortableDataDir: state.hasPortableDataDir,
      legacyMigration: await this.getLegacyMigrationStatus(),
    };
  }

  async getStatus() {
    return UserDataService.getStatus();
  }

  async open(target: 'active' | 'config' | 'portable' | 'app' = 'active') {
    const state = UserDataService.getState();
    const pathMap = {
      active: state.activeUserDataRoot,
      config: state.configRoot,
      portable: state.portableDataRoot,
      app: state.appRoot,
    };
    await fs.mkdir(pathMap[target], { recursive: true });
    await _open(pathMap[target]);
    return { success: true };
  }

  async migrateLegacy(): Promise<UserDataOperationResultDto> {
    const result = await UserDataService.migrateLegacyData();
    return this.toOperationResult(
      result.conflicts.length === 0,
      result.conflicts.length === 0 ? 'Legacy data migrated.' : 'Migration has conflicts.',
      result.conflicts,
    );
  }

  async setUserDataPath(userDataPath: string): Promise<UserDataOperationResultDto> {
    const state = UserDataService.getState();
    await UserDataService.getStatus();
    if (state.isPortable) {
      return this.toOperationResult(
        false,
        'Portable mode is active. Disable portable mode before changing user data path.',
        [],
      );
    }

    const targetPath = path.resolve(decodeURI(userDataPath));
    const currentPath = state.activeUserDataRoot;
    if (path.resolve(targetPath) === path.resolve(currentPath)) {
      return this.toOperationResult(true, 'User data path unchanged.', []);
    }
    if (UserDataService.arePathsNested(currentPath, targetPath)) {
      return this.toOperationResult(
        false,
        'User data path was not changed because the current and target directories overlap.',
        [],
      );
    }

    const moveResult = await UserDataService.moveDataRoot(currentPath, targetPath);
    if (moveResult.conflicts.length > 0) {
      return this.toOperationResult(
        false,
        'User data path was not changed because some files already exist at the target.',
        moveResult.conflicts,
      );
    }

    state.config.userDataPath =
      path.resolve(targetPath) === path.resolve(state.defaultUserDataRoot)
        ? undefined
        : targetPath;
    state.configuredUserDataRoot = state.config.userDataPath ?? state.defaultUserDataRoot;
    state.activeUserDataRoot = state.configuredUserDataRoot;
    await UserDataService.saveConfig(state.config);
    await UserDataService.ensureStateDirectories();
    return this.toOperationResult(true, 'User data path changed.', []);
  }

  async resetUserDataPath(): Promise<UserDataOperationResultDto> {
    return this.setUserDataPath(UserDataService.getState().defaultUserDataRoot);
  }

  async setPortableMode(portable: boolean): Promise<UserDataOperationResultDto> {
    const state = UserDataService.getState();
    await UserDataService.getStatus();
    if (portable === state.isPortable) {
      return this.toOperationResult(true, 'Portable mode unchanged.', []);
    }

    if (portable) {
      const moveResult = await UserDataService.moveDataRoot(
        state.activeUserDataRoot,
        state.portableDataRoot,
      );
      if (moveResult.conflicts.length > 0) {
        return this.toOperationResult(
          false,
          'Portable mode was not enabled because some files already exist in the portable data directory.',
          moveResult.conflicts,
        );
      }
      await fs.mkdir(state.portableDataRoot, { recursive: true });
      state.isPortable = true;
      state.hasPortableDataDir = true;
      state.activeUserDataRoot = state.portableDataRoot;
      await UserDataService.ensureStateDirectories();
      return this.toOperationResult(true, 'Portable mode enabled.', []);
    }

    const targetPath = state.configuredUserDataRoot;
    const moveResult = await UserDataService.moveDataRoot(
      state.portableDataRoot,
      targetPath,
      true,
    );
    if (moveResult.conflicts.length > 0) {
      return this.toOperationResult(
        false,
        'Portable mode was not disabled because some files already exist in the target user data directory.',
        moveResult.conflicts,
      );
    }
    await fs.rm(state.portableDataRoot, { recursive: true, force: true });
    state.isPortable = false;
    state.hasPortableDataDir = false;
    state.activeUserDataRoot = state.configuredUserDataRoot;
    await UserDataService.ensureStateDirectories();
    return this.toOperationResult(true, 'Portable mode disabled.', []);
  }

  private async toOperationResult(
    success: boolean,
    message: string,
    conflicts: string[],
  ): Promise<UserDataOperationResultDto> {
    return {
      success,
      message,
      conflicts,
      status: await UserDataService.getStatus(),
    };
  }

  private static async createState(): Promise<UserDataState> {
    const appRoot = process.cwd();
    const configRoot = this.getDefaultUserDataRoot();
    const configPath = path.join(configRoot, CONFIG_FILE_NAME);
    await fs.mkdir(configRoot, { recursive: true });
    const config = await this.readConfig(configPath);
    const defaultUserDataRoot = configRoot;
    const configuredUserDataRoot =
      config.userDataPath && config.userDataPath.trim() !== ''
        ? path.resolve(config.userDataPath)
        : defaultUserDataRoot;
    const portableDataRoot = path.join(appRoot, PORTABLE_DATA_DIR_NAME);
    const hasPortableDataDir = await this.pathIsDir(portableDataRoot);
    const isPortable = hasPortableDataDir;

    return {
      appRoot,
      configRoot,
      configPath,
      defaultUserDataRoot,
      configuredUserDataRoot,
      activeUserDataRoot: isPortable ? portableDataRoot : configuredUserDataRoot,
      portableDataRoot,
      isPortable,
      hasPortableDataDir,
      config,
    };
  }

  private static getDefaultUserDataRoot() {
    return path.join(os.homedir(), USER_DATA_DIR_NAME);
  }

  private static async readConfig(configPath: string): Promise<UserDataConfig> {
    try {
      const text = await fs.readFile(configPath, 'utf8');
      const parsed = JSON.parse(text) as UserDataConfig;
      return { version: CONFIG_VERSION, ...parsed };
    } catch {
      return { version: CONFIG_VERSION };
    }
  }

  private static async saveConfig(config: UserDataConfig) {
    const state = this.getState();
    const normalizedConfig = {
      ...config,
      version: CONFIG_VERSION,
    };
    await fs.mkdir(state.configRoot, { recursive: true });
    await fs.writeFile(
      state.configPath,
      JSON.stringify(normalizedConfig, null, 2),
    );
    state.config = normalizedConfig;
  }

  private static async ensureStateDirectories() {
    const state = this.getState();
    await Promise.all([
      fs.mkdir(state.configRoot, { recursive: true }),
      fs.mkdir(state.activeUserDataRoot, { recursive: true }),
      ...MANAGED_DATA_DIRS.map((dir) =>
        fs.mkdir(path.join(state.activeUserDataRoot, dir), {
          recursive: true,
        }),
      ),
    ]);
  }

  private static resolveTemplateLogicalPath(templatePath: string) {
    const [templateName, ...rest] = templatePath.split('/');
    const relativePath = rest.join('/');
    const userTemplatePath = this.safeResolve(
      this.getUserTemplateRoot(templateName),
      relativePath,
    );
    if (this.existsSync(userTemplatePath)) return userTemplatePath;
    const installTemplatePath = this.safeResolve(
      this.getInstallPath(`public/templates/${templateName}`),
      relativePath,
    );
    return this.existsSync(installTemplatePath)
      ? installTemplatePath
      : userTemplatePath;
  }

  private static async getLegacyMigrationStatus(): Promise<UserDataLegacyMigrationStatusDto> {
    const [legacyGames, legacyTemplates, legacyDerivatives, dataGames, dataTemplates] =
      await Promise.all([
        this.hasVisibleChildren(this.getInstallPath('public/games')),
        this.hasLegacyCustomTemplates(),
        this.hasVisibleChildren(this.getInstallPath('assets/templates/Derivative_Engine')),
        this.hasVisibleChildren(this.getGameRoot()),
        this.hasVisibleChildren(this.getUserTemplateRoot()),
      ]);
    return {
      hasLegacyGames: legacyGames,
      hasLegacyCustomTemplates: legacyTemplates,
      hasLegacyDerivativeEngines: legacyDerivatives,
      needsMigrationNotice:
        legacyGames ||
        legacyTemplates ||
        legacyDerivatives ||
        !dataGames ||
        !dataTemplates,
    };
  }

  private static async migrateLegacyData(): Promise<MoveResult> {
    await this.ensureStateDirectories();
    const result: MoveResult = { moved: [], conflicts: [] };

    await this.moveDirectoryChildren(
      this.getInstallPath('public/games'),
      this.getGameRoot(),
      result,
    );
    await this.moveDirectoryChildren(
      this.getInstallPath('public/templates'),
      this.getUserTemplateRoot(),
      result,
      { filter: (entry) => !BUILT_IN_TEMPLATE_DIRS.has(entry) },
    );
    await this.moveDirectoryChildren(
      this.getInstallPath('assets/templates/Derivative_Engine'),
      this.getDerivativeEngineRoot(),
      result,
    );

    return result;
  }

  private static async moveDataRoot(
    sourceRoot: string,
    targetRoot: string,
    includeAllEntries = false,
  ): Promise<MoveResult> {
    await fs.mkdir(sourceRoot, { recursive: true });
    await fs.mkdir(targetRoot, { recursive: true });
    const result: MoveResult = { moved: [], conflicts: [] };
    if (includeAllEntries) {
      await this.moveDirectoryChildren(sourceRoot, targetRoot, result, {
        skipHidden: false,
      });
    } else {
      await this.moveManagedDataDirs(sourceRoot, targetRoot, result);
    }
    return result;
  }

  private static async moveManagedDataDirs(
    sourceRoot: string,
    targetRoot: string,
    result: MoveResult,
  ) {
    for (const entry of MANAGED_DATA_DIRS) {
      const sourcePath = path.join(sourceRoot, entry);
      if (!(await this.pathExists(sourcePath))) continue;
      const targetPath = path.join(targetRoot, entry);
      if (await this.pathExists(targetPath)) {
        result.conflicts.push(targetPath);
        continue;
      }
      await this.movePath(sourcePath, targetPath);
      result.moved.push(targetPath);
    }
  }

  private static async moveDirectoryChildren(
    sourceRoot: string,
    targetRoot: string,
    result: MoveResult,
    options: {
      filter?: (entry: string) => boolean;
      skipHidden?: boolean;
    } = {},
  ) {
    const { filter = () => true, skipHidden = true } = options;
    if (!(await this.pathIsDir(sourceRoot))) return;
    await fs.mkdir(targetRoot, { recursive: true });
    const entries = await fs.readdir(sourceRoot);
    for (const entry of entries) {
      if (
        entry === '.gitkeep' ||
        (skipHidden && entry.startsWith('.')) ||
        !filter(entry)
      ) {
        continue;
      }
      const sourcePath = path.join(sourceRoot, entry);
      const targetPath = path.join(targetRoot, entry);
      if (await this.pathExists(targetPath)) {
        result.conflicts.push(targetPath);
        continue;
      }
      await this.movePath(sourcePath, targetPath);
      result.moved.push(targetPath);
    }
  }

  private static async movePath(sourcePath: string, targetPath: string) {
    await fs.mkdir(path.dirname(targetPath), { recursive: true });
    try {
      await fs.rename(sourcePath, targetPath);
    } catch {
      await fs.cp(sourcePath, targetPath, { recursive: true });
      await fs.rm(sourcePath, { recursive: true, force: true });
    }
  }

  private static async hasLegacyCustomTemplates() {
    const templateRoot = this.getInstallPath('public/templates');
    if (!(await this.pathIsDir(templateRoot))) return false;
    const entries = await fs.readdir(templateRoot);
    return entries.some(
      (entry) => !entry.startsWith('.') && !BUILT_IN_TEMPLATE_DIRS.has(entry),
    );
  }

  private static async hasVisibleChildren(dir: string) {
    if (!(await this.pathIsDir(dir))) return false;
    const entries = await fs.readdir(dir);
    return entries.some((entry) => !entry.startsWith('.'));
  }

  private static async pathExists(targetPath: string) {
    return fs
      .stat(targetPath)
      .then(() => true)
      .catch(() => false);
  }

  private static async pathIsDir(targetPath: string) {
    return fs
      .stat(targetPath)
      .then((stats) => stats.isDirectory())
      .catch(() => false);
  }

  private static existsSync(targetPath: string) {
    try {
      require('fs').statSync(targetPath);
      return true;
    } catch {
      return false;
    }
  }

  private static safeResolve(root: string, relativePath = '') {
    const resolvedRoot = path.resolve(root);
    const resolvedPath = path.resolve(resolvedRoot, decodeURI(relativePath));
    if (!this.isPathInside(resolvedRoot, resolvedPath)) {
      throw new Error(`Path is outside allowed root: ${relativePath}`);
    }
    return resolvedPath;
  }

  private static isPathInside(root: string, pathToCheck: string) {
    const relativePath = path.relative(path.resolve(root), path.resolve(pathToCheck));
    return (
      relativePath === '' ||
      (!relativePath.startsWith('..') && !path.isAbsolute(relativePath))
    );
  }

  private static arePathsNested(a: string, b: string) {
    return this.isPathInside(a, b) || this.isPathInside(b, a);
  }
}
