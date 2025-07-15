/* eslint-disable */
/* tslint:disable */
// @ts-nocheck
/*
 * ---------------------------------------------------------------
 * ## THIS FILE WAS GENERATED VIA SWAGGER-TYPESCRIPT-API        ##
 * ##                                                           ##
 * ## AUTHOR: acacode                                           ##
 * ## SOURCE: https://github.com/acacode/swagger-typescript-api ##
 * ---------------------------------------------------------------
 */

export interface OsInfoDto {
  /** The platform of the operating system */
  platform: string;
  /** The architecture of the operating system */
  arch: string;
}

export interface CreateNewFileDto {
  /** The source path where the directory will be created */
  source: string;
  /** Name for the new file */
  name: string;
}

export interface CreateNewFolderDto {
  /** The source path where the directory will be created */
  source: string;
  /** Name for the new directory */
  name: string;
}

export interface UploadFilesDto {
  /** Target directory for the uploaded files */
  targetDirectory: string;
}

export interface DeleteFileOrDirDto {
  /** The source path of the file or directory to be deleted */
  source: string;
}

export interface RenameFileDto {
  /** The source path of the file or directory to be renamed */
  source: string;
  /** New name for renaming the file or directory */
  newName: string;
}

export interface EditTextFileDto {
  /** The path of textfile */
  path: string;
  /** Text data content */
  textFile: string;
}

export interface TemplateConfigDto {
  /** The name of the template */
  name: string;
  /** The id of the template */
  id: string;
  /** The webgal version of the template */
  "webgal-version": string;
}

export interface GameInfoDto {
  /** The name of the game */
  name: string;
  /** The dir of the game */
  dir: string;
  /** The cover of the game */
  cover: string;
  /** The template config of the game */
  template: TemplateConfigDto;
}

export interface CreateGameDto {
  /** The name of the game to be created */
  gameName: string;
  /** The dir of the game to be created */
  gameDir: string;
  /** The name of the derivative to be used */
  derivative?: string;
  /** The dir of the template to be applied */
  templateDir?: string;
}

export interface EditFileNameDto {
  /** The path to the file to be renamed */
  path: string;
  /** The new name for the file */
  newName: string;
}

export interface DeleteFileDto {
  /** The path to the file to be deleted */
  path: string;
}

export interface CreateNewSceneDto {
  /** The name of the game */
  gameName: string;
  /** The name of the scene */
  sceneName: string;
}

export interface EditSceneDto {
  /** The name of the game */
  gameName: string;
  /** The name of the scene */
  sceneName: string;
  /**
   * Scene data content
   * @format { value: string }
   */
  sceneData: string;
}

export interface GameConfigDto {
  /** The name of the game */
  gameName: string;
  /** New game configuration */
  newConfig: string;
}

export interface MkDirDto {
  /** The source path where the directory will be created */
  source: string;
  /** Name for the new directory */
  name: string;
}

export interface DeleteDto {
  /** The source path of the file or directory to be deleted */
  gameName: string;
}

export interface RenameDto {
  /** Old name for renaming the game */
  gameName: string;
  /** New name for renaming the game */
  newName: string;
}

export interface IconsDto {
  /** The icons of the game */
  platforms: string[];
}

export interface TemplateInfoDto {
  /** The name of the template */
  name: string;
  /** The id of the template */
  id: string;
  /** The webgal version of the template */
  "webgal-version": string;
  /** The dir of the template */
  dir: string;
}

export interface CreateTemplateDto {
  /** The name of the template to be created */
  templateName: string;
  /** The dir of the template */
  templateDir: string;
}

export interface UpdateTemplateConfigDto {
  /** The dir of the template */
  templateDir: string;
  /** The new config of the template */
  newTemplateConfig: TemplateConfigDto;
}

export interface ApplyTemplateToGameDto {
  /** The template name to apply */
  templateDir: string;
  /** The game name to be applied. */
  gameDir: string;
}

export interface GetStyleByClassNameDto {
  /** The name of class to be fetched */
  className: string;
  /** The path of stylesheet file to be fetched */
  filePath: string;
}

import type {
  AxiosInstance,
  AxiosRequestConfig,
  AxiosResponse,
  HeadersDefaults,
  ResponseType,
} from "axios";
import axios from "axios";

export type QueryParamsType = Record<string | number, any>;

export interface FullRequestParams
  extends Omit<AxiosRequestConfig, "data" | "params" | "url" | "responseType"> {
  /** set parameter to `true` for call `securityWorker` for this request */
  secure?: boolean;
  /** request path */
  path: string;
  /** content type of request body */
  type?: ContentType;
  /** query params */
  query?: QueryParamsType;
  /** format of response (i.e. response.json() -> format: "json") */
  format?: ResponseType;
  /** request body */
  body?: unknown;
}

export type RequestParams = Omit<
  FullRequestParams,
  "body" | "method" | "query" | "path"
>;

export interface ApiConfig<SecurityDataType = unknown>
  extends Omit<AxiosRequestConfig, "data" | "cancelToken"> {
  securityWorker?: (
    securityData: SecurityDataType | null,
  ) => Promise<AxiosRequestConfig | void> | AxiosRequestConfig | void;
  secure?: boolean;
  format?: ResponseType;
}

export enum ContentType {
  Json = "application/json",
  JsonApi = "application/vnd.api+json",
  FormData = "multipart/form-data",
  UrlEncoded = "application/x-www-form-urlencoded",
  Text = "text/plain",
}

export class HttpClient<SecurityDataType = unknown> {
  public instance: AxiosInstance;
  private securityData: SecurityDataType | null = null;
  private securityWorker?: ApiConfig<SecurityDataType>["securityWorker"];
  private secure?: boolean;
  private format?: ResponseType;

  constructor({
    securityWorker,
    secure,
    format,
    ...axiosConfig
  }: ApiConfig<SecurityDataType> = {}) {
    this.instance = axios.create({
      ...axiosConfig,
      baseURL: axiosConfig.baseURL || "",
    });
    this.secure = secure;
    this.format = format;
    this.securityWorker = securityWorker;
  }

  public setSecurityData = (data: SecurityDataType | null) => {
    this.securityData = data;
  };

  protected mergeRequestParams(
    params1: AxiosRequestConfig,
    params2?: AxiosRequestConfig,
  ): AxiosRequestConfig {
    const method = params1.method || (params2 && params2.method);

    return {
      ...this.instance.defaults,
      ...params1,
      ...(params2 || {}),
      headers: {
        ...((method &&
          this.instance.defaults.headers[
            method.toLowerCase() as keyof HeadersDefaults
          ]) ||
          {}),
        ...(params1.headers || {}),
        ...((params2 && params2.headers) || {}),
      },
    };
  }

  protected stringifyFormItem(formItem: unknown) {
    if (typeof formItem === "object" && formItem !== null) {
      return JSON.stringify(formItem);
    } else {
      return `${formItem}`;
    }
  }

  protected createFormData(input: Record<string, unknown>): FormData {
    if (input instanceof FormData) {
      return input;
    }
    return Object.keys(input || {}).reduce((formData, key) => {
      const property = input[key];
      const propertyContent: any[] =
        property instanceof Array ? property : [property];

      for (const formItem of propertyContent) {
        const isFileType = formItem instanceof Blob || formItem instanceof File;
        formData.append(
          key,
          isFileType ? formItem : this.stringifyFormItem(formItem),
        );
      }

      return formData;
    }, new FormData());
  }

  public request = async <T = any, _E = any>({
    secure,
    path,
    type,
    query,
    format,
    body,
    ...params
  }: FullRequestParams): Promise<AxiosResponse<T>> => {
    const secureParams =
      ((typeof secure === "boolean" ? secure : this.secure) &&
        this.securityWorker &&
        (await this.securityWorker(this.securityData))) ||
      {};
    const requestParams = this.mergeRequestParams(params, secureParams);
    const responseFormat = format || this.format || undefined;

    if (
      type === ContentType.FormData &&
      body &&
      body !== null &&
      typeof body === "object"
    ) {
      body = this.createFormData(body as Record<string, unknown>);
    }

    if (
      type === ContentType.Text &&
      body &&
      body !== null &&
      typeof body !== "string"
    ) {
      body = JSON.stringify(body);
    }

    return this.instance.request({
      ...requestParams,
      headers: {
        ...(requestParams.headers || {}),
        ...(type ? { "Content-Type": type } : {}),
      },
      params: query,
      responseType: responseFormat,
      data: body,
      url: path,
    });
  };
}

/**
 * @title WebGAL Terre API
 * @version 1.0
 * @contact
 *
 * API Refrence of WebGAL Terre Editor
 */
export class Api<
  SecurityDataType extends unknown,
> extends HttpClient<SecurityDataType> {
  api = {
    /**
     * No description
     *
     * @tags App
     * @name AppControllerApiTest
     * @request GET:/api/test
     */
    appControllerApiTest: (params: RequestParams = {}) =>
      this.request<void, any>({
        path: `/api/test`,
        method: "GET",
        ...params,
      }),

    /**
     * No description
     *
     * @tags App
     * @name AppControllerGetOsInfo
     * @request GET:/api/osinfo
     */
    appControllerGetOsInfo: (params: RequestParams = {}) =>
      this.request<OsInfoDto, any>({
        path: `/api/osinfo`,
        method: "GET",
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags Assets
     * @name AssetsControllerReadAssets
     * @summary Read Assets
     * @request GET:/api/assets/readAssets/{readDirPath}
     */
    assetsControllerReadAssets: (
      readDirPath: string,
      params: RequestParams = {},
    ) =>
      this.request<void, any>({
        path: `/api/assets/readAssets/${readDirPath}`,
        method: "GET",
        ...params,
      }),

    /**
     * No description
     *
     * @tags Assets
     * @name AssetsControllerOpenDict
     * @summary Open Assets Dictionary
     * @request POST:/api/assets/openDict/{dirPath}
     */
    assetsControllerOpenDict: (dirPath: string, params: RequestParams = {}) =>
      this.request<void, any>({
        path: `/api/assets/openDict/${dirPath}`,
        method: "POST",
        ...params,
      }),

    /**
     * No description
     *
     * @tags Assets
     * @name AssetsControllerCreateNewFile
     * @summary Create a New FIle
     * @request POST:/api/assets/createNewFile
     */
    assetsControllerCreateNewFile: (
      data: CreateNewFileDto,
      params: RequestParams = {},
    ) =>
      this.request<void, void>({
        path: `/api/assets/createNewFile`,
        method: "POST",
        body: data,
        type: ContentType.Json,
        ...params,
      }),

    /**
     * No description
     *
     * @tags Assets
     * @name AssetsControllerCreateNewFolder
     * @summary Create Folder
     * @request POST:/api/assets/createNewFolder
     */
    assetsControllerCreateNewFolder: (
      data: CreateNewFolderDto,
      params: RequestParams = {},
    ) =>
      this.request<void, void>({
        path: `/api/assets/createNewFolder`,
        method: "POST",
        body: data,
        type: ContentType.Json,
        ...params,
      }),

    /**
     * No description
     *
     * @tags Assets
     * @name AssetsControllerUpload
     * @summary Upload Files
     * @request POST:/api/assets/upload
     */
    assetsControllerUpload: (
      data: UploadFilesDto,
      params: RequestParams = {},
    ) =>
      this.request<void, void>({
        path: `/api/assets/upload`,
        method: "POST",
        body: data,
        type: ContentType.Json,
        ...params,
      }),

    /**
     * No description
     *
     * @tags Assets
     * @name AssetsControllerDeleteFileOrDir
     * @summary Delete File or Directory
     * @request POST:/api/assets/delete
     */
    assetsControllerDeleteFileOrDir: (
      data: DeleteFileOrDirDto,
      params: RequestParams = {},
    ) =>
      this.request<void, void>({
        path: `/api/assets/delete`,
        method: "POST",
        body: data,
        type: ContentType.Json,
        ...params,
      }),

    /**
     * No description
     *
     * @tags Assets
     * @name AssetsControllerRename
     * @summary Rename File or Directory
     * @request POST:/api/assets/rename
     */
    assetsControllerRename: (data: RenameFileDto, params: RequestParams = {}) =>
      this.request<void, void>({
        path: `/api/assets/rename`,
        method: "POST",
        body: data,
        type: ContentType.Json,
        ...params,
      }),

    /**
     * No description
     *
     * @tags Assets
     * @name AssetsControllerEditTextFile
     * @summary Edit Text File
     * @request POST:/api/assets/editTextFile
     */
    assetsControllerEditTextFile: (
      data: EditTextFileDto,
      params: RequestParams = {},
    ) =>
      this.request<void, void>({
        path: `/api/assets/editTextFile`,
        method: "POST",
        body: data,
        type: ContentType.Json,
        ...params,
      }),

    /**
     * No description
     *
     * @tags Manage Game
     * @name ManageGameControllerGetGameList
     * @summary Retrieve game list
     * @request GET:/api/manageGame/gameList
     */
    manageGameControllerGetGameList: (params: RequestParams = {}) =>
      this.request<GameInfoDto[], any>({
        path: `/api/manageGame/gameList`,
        method: "GET",
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags Manage Game
     * @name ManageGameControllerCreateGame
     * @summary Create a new game
     * @request POST:/api/manageGame/createGame
     */
    manageGameControllerCreateGame: (
      data: CreateGameDto,
      params: RequestParams = {},
    ) =>
      this.request<void, any>({
        path: `/api/manageGame/createGame`,
        method: "POST",
        body: data,
        type: ContentType.Json,
        ...params,
      }),

    /**
     * No description
     *
     * @tags Manage Game
     * @name ManageGameControllerOpenGameDict
     * @summary Open Game Dictionary
     * @request GET:/api/manageGame/openGameDict/{gameName}
     */
    manageGameControllerOpenGameDict: (
      gameName: string,
      params: RequestParams = {},
    ) =>
      this.request<void, any>({
        path: `/api/manageGame/openGameDict/${gameName}`,
        method: "GET",
        ...params,
      }),

    /**
     * No description
     *
     * @tags Manage Game
     * @name ManageGameControllerGetDerivativeEngines
     * @summary Retrieve Derivative Engines
     * @request GET:/api/manageGame/derivativeEngines
     */
    manageGameControllerGetDerivativeEngines: (params: RequestParams = {}) =>
      this.request<void, any>({
        path: `/api/manageGame/derivativeEngines`,
        method: "GET",
        ...params,
      }),

    /**
     * No description
     *
     * @tags Manage Game
     * @name ManageGameControllerOpenGameAssetsDict
     * @summary Open Game Assets Dictionary
     * @request GET:/api/manageGame/openGameAssetsDict/{gameName}
     */
    manageGameControllerOpenGameAssetsDict: (
      gameName: string,
      query: {
        subFolder: string;
      },
      params: RequestParams = {},
    ) =>
      this.request<void, any>({
        path: `/api/manageGame/openGameAssetsDict/${gameName}`,
        method: "GET",
        query: query,
        ...params,
      }),

    /**
     * No description
     *
     * @tags Manage Game
     * @name ManageGameControllerEjectGameAsWeb
     * @summary Eject Game As Web App
     * @request GET:/api/manageGame/ejectGameAsWeb/{gameName}
     */
    manageGameControllerEjectGameAsWeb: (
      gameName: string,
      params: RequestParams = {},
    ) =>
      this.request<void, any>({
        path: `/api/manageGame/ejectGameAsWeb/${gameName}`,
        method: "GET",
        ...params,
      }),

    /**
     * No description
     *
     * @tags Manage Game
     * @name ManageGameControllerEjectGameAsExe
     * @summary Eject Game As EXE
     * @request GET:/api/manageGame/ejectGameAsExe/{gameName}
     */
    manageGameControllerEjectGameAsExe: (
      gameName: string,
      params: RequestParams = {},
    ) =>
      this.request<void, any>({
        path: `/api/manageGame/ejectGameAsExe/${gameName}`,
        method: "GET",
        ...params,
      }),

    /**
     * No description
     *
     * @tags Manage Game
     * @name ManageGameControllerEjectGameAsAndroid
     * @summary Eject Game As Android App
     * @request GET:/api/manageGame/ejectGameAsAndroid/{gameName}
     */
    manageGameControllerEjectGameAsAndroid: (
      gameName: string,
      params: RequestParams = {},
    ) =>
      this.request<void, any>({
        path: `/api/manageGame/ejectGameAsAndroid/${gameName}`,
        method: "GET",
        ...params,
      }),

    /**
     * No description
     *
     * @tags Manage Game
     * @name ManageGameControllerReadGameAssets
     * @summary Read Game Assets
     * @request GET:/api/manageGame/readGameAssets/{readDirPath}
     */
    manageGameControllerReadGameAssets: (
      readDirPath: string,
      params: RequestParams = {},
    ) =>
      this.request<void, any>({
        path: `/api/manageGame/readGameAssets/${readDirPath}`,
        method: "GET",
        ...params,
      }),

    /**
     * No description
     *
     * @tags Manage Game
     * @name ManageGameControllerEditFileName
     * @summary Edit File Name
     * @request POST:/api/manageGame/editFileName
     */
    manageGameControllerEditFileName: (
      data: EditFileNameDto,
      params: RequestParams = {},
    ) =>
      this.request<void, void>({
        path: `/api/manageGame/editFileName`,
        method: "POST",
        body: data,
        type: ContentType.Json,
        ...params,
      }),

    /**
     * No description
     *
     * @tags Manage Game
     * @name ManageGameControllerDeleteFile
     * @summary Delete File
     * @request POST:/api/manageGame/deleteFile
     */
    manageGameControllerDeleteFile: (
      data: DeleteFileDto,
      params: RequestParams = {},
    ) =>
      this.request<void, void>({
        path: `/api/manageGame/deleteFile`,
        method: "POST",
        body: data,
        type: ContentType.Json,
        ...params,
      }),

    /**
     * No description
     *
     * @tags Manage Game
     * @name ManageGameControllerCreateNewScene
     * @summary Create a New Scene
     * @request POST:/api/manageGame/createNewScene
     */
    manageGameControllerCreateNewScene: (
      data: CreateNewSceneDto,
      params: RequestParams = {},
    ) =>
      this.request<void, void>({
        path: `/api/manageGame/createNewScene`,
        method: "POST",
        body: data,
        type: ContentType.Json,
        ...params,
      }),

    /**
     * No description
     *
     * @tags Manage Game
     * @name ManageGameControllerEditScene
     * @summary Edit Scene
     * @request POST:/api/manageGame/editScene
     */
    manageGameControllerEditScene: (
      data: EditSceneDto,
      params: RequestParams = {},
    ) =>
      this.request<void, void>({
        path: `/api/manageGame/editScene`,
        method: "POST",
        body: data,
        type: ContentType.Json,
        ...params,
      }),

    /**
     * No description
     *
     * @tags Manage Game
     * @name ManageGameControllerEditTextFile
     * @summary Edit TextFile
     * @request POST:/api/manageGame/editTextFile
     */
    manageGameControllerEditTextFile: (
      data: EditTextFileDto,
      params: RequestParams = {},
    ) =>
      this.request<void, void>({
        path: `/api/manageGame/editTextFile`,
        method: "POST",
        body: data,
        type: ContentType.Json,
        ...params,
      }),

    /**
     * No description
     *
     * @tags Manage Game
     * @name ManageGameControllerGetGameConfig
     * @summary Get Game Configuration
     * @request GET:/api/manageGame/getGameConfig/{gameName}
     */
    manageGameControllerGetGameConfig: (
      gameName: string,
      params: RequestParams = {},
    ) =>
      this.request<void, void>({
        path: `/api/manageGame/getGameConfig/${gameName}`,
        method: "GET",
        ...params,
      }),

    /**
     * No description
     *
     * @tags Manage Game
     * @name ManageGameControllerSetGameConfig
     * @summary Set Game Configuration
     * @request POST:/api/manageGame/setGameConfig
     */
    manageGameControllerSetGameConfig: (
      data: GameConfigDto,
      params: RequestParams = {},
    ) =>
      this.request<void, void>({
        path: `/api/manageGame/setGameConfig`,
        method: "POST",
        body: data,
        type: ContentType.Json,
        ...params,
      }),

    /**
     * No description
     *
     * @tags Manage Game
     * @name ManageGameControllerUploadFiles
     * @summary Upload Files
     * @request POST:/api/manageGame/uploadFiles
     */
    manageGameControllerUploadFiles: (
      data: UploadFilesDto,
      params: RequestParams = {},
    ) =>
      this.request<void, void>({
        path: `/api/manageGame/uploadFiles`,
        method: "POST",
        body: data,
        type: ContentType.Json,
        ...params,
      }),

    /**
     * No description
     *
     * @tags Manage Game
     * @name ManageGameControllerMkDir
     * @summary Create Directory
     * @request POST:/api/manageGame/mkdir
     */
    manageGameControllerMkDir: (data: MkDirDto, params: RequestParams = {}) =>
      this.request<void, void>({
        path: `/api/manageGame/mkdir`,
        method: "POST",
        body: data,
        type: ContentType.Json,
        ...params,
      }),

    /**
     * No description
     *
     * @tags Manage Game
     * @name ManageGameControllerDelete
     * @summary Delete File or Directory
     * @request POST:/api/manageGame/delete
     */
    manageGameControllerDelete: (data: DeleteDto, params: RequestParams = {}) =>
      this.request<void, void>({
        path: `/api/manageGame/delete`,
        method: "POST",
        body: data,
        type: ContentType.Json,
        ...params,
      }),

    /**
     * No description
     *
     * @tags Manage Game
     * @name ManageGameControllerRename
     * @summary Rename File or Directory
     * @request POST:/api/manageGame/rename
     */
    manageGameControllerRename: (data: RenameDto, params: RequestParams = {}) =>
      this.request<void, void>({
        path: `/api/manageGame/rename`,
        method: "POST",
        body: data,
        type: ContentType.Json,
        ...params,
      }),

    /**
     * No description
     *
     * @tags Manage Game
     * @name ManageGameControllerGetIcons
     * @summary Get Game Icons
     * @request GET:/api/manageGame/getIcons/{gameDir}
     */
    manageGameControllerGetIcons: (
      gameDir: string,
      params: RequestParams = {},
    ) =>
      this.request<IconsDto, void>({
        path: `/api/manageGame/getIcons/${gameDir}`,
        method: "GET",
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags Manage Template
     * @name ManageTemplateControllerGetTemplateList
     * @summary Retrieve template list
     * @request GET:/api/manageTemplate/templateList
     */
    manageTemplateControllerGetTemplateList: (params: RequestParams = {}) =>
      this.request<TemplateInfoDto[], void>({
        path: `/api/manageTemplate/templateList`,
        method: "GET",
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags Manage Template
     * @name ManageTemplateControllerCreateTemplate
     * @summary Create a new template
     * @request POST:/api/manageTemplate/createTemplate
     */
    manageTemplateControllerCreateTemplate: (
      data: CreateTemplateDto,
      params: RequestParams = {},
    ) =>
      this.request<void, void>({
        path: `/api/manageTemplate/createTemplate`,
        method: "POST",
        body: data,
        type: ContentType.Json,
        ...params,
      }),

    /**
     * No description
     *
     * @tags Manage Template
     * @name ManageTemplateControllerGetTemplateConfig
     * @summary Get Template Configuration
     * @request GET:/api/manageTemplate/getTemplateConfig/{templateDir}
     */
    manageTemplateControllerGetTemplateConfig: (
      templateDir: string,
      params: RequestParams = {},
    ) =>
      this.request<TemplateConfigDto, void>({
        path: `/api/manageTemplate/getTemplateConfig/${templateDir}`,
        method: "GET",
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags Manage Template
     * @name ManageTemplateControllerUpdateTemplateConfig
     * @summary Update template configuration
     * @request PUT:/api/manageTemplate/updateTemplateConfig
     */
    manageTemplateControllerUpdateTemplateConfig: (
      data: UpdateTemplateConfigDto,
      params: RequestParams = {},
    ) =>
      this.request<void, void>({
        path: `/api/manageTemplate/updateTemplateConfig`,
        method: "PUT",
        body: data,
        type: ContentType.Json,
        ...params,
      }),

    /**
     * No description
     *
     * @tags Manage Template
     * @name ManageTemplateControllerDeleteTemplate
     * @summary Delete Template
     * @request DELETE:/api/manageTemplate/delete/{templateDir}
     */
    manageTemplateControllerDeleteTemplate: (
      templateDir: string,
      params: RequestParams = {},
    ) =>
      this.request<void, void>({
        path: `/api/manageTemplate/delete/${templateDir}`,
        method: "DELETE",
        ...params,
      }),

    /**
     * No description
     *
     * @tags Manage Template
     * @name ManageTemplateControllerApplyTemplateToGame
     * @summary Apply template to a game
     * @request POST:/api/manageTemplate/applyTemplateToGame
     */
    manageTemplateControllerApplyTemplateToGame: (
      data: ApplyTemplateToGameDto,
      params: RequestParams = {},
    ) =>
      this.request<void, void>({
        path: `/api/manageTemplate/applyTemplateToGame`,
        method: "POST",
        body: data,
        type: ContentType.Json,
        ...params,
      }),

    /**
     * No description
     *
     * @tags Manage Template
     * @name ManageTemplateControllerGetStyleByClassName
     * @summary Get style by class name
     * @request POST:/api/manageTemplate/getStyleByClassName
     */
    manageTemplateControllerGetStyleByClassName: (
      data: GetStyleByClassNameDto,
      params: RequestParams = {},
    ) =>
      this.request<string, void>({
        path: `/api/manageTemplate/getStyleByClassName`,
        method: "POST",
        body: data,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),
  };
  templatePreview = {
    /**
     * No description
     *
     * @name TemplatePreviewControllerGetTemplateAsset
     * @request GET:/template-preview/{templateName}/game/template/{path}
     */
    templatePreviewControllerGetTemplateAsset: (
      path: string,
      templateName: string,
      params: RequestParams = {},
    ) =>
      this.request<void, any>({
        path: `/template-preview/${templateName}/game/template/${path}`,
        method: "GET",
        ...params,
      }),
  };
}
