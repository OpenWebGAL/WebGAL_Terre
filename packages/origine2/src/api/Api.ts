/* eslint-disable */
/* tslint:disable */
/*
 * ---------------------------------------------------------------
 * ## THIS FILE WAS GENERATED VIA SWAGGER-TYPESCRIPT-API        ##
 * ##                                                           ##
 * ## AUTHOR: acacode                                           ##
 * ## SOURCE: https://github.com/acacode/swagger-typescript-api ##
 * ---------------------------------------------------------------
 */

export interface CompletionDto {
  /** Editor input value for which the completion is required */
  editorValue: string;
  /** Parameters required for completion */
  params: object;
}

export interface CreateGameDto {
  /** The name of the game to be created */
  gameName: string;
}

export interface CreateTemplateDto {
  /** The name of the game to be created */
  templateName: string;
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

export interface EditTextFileDto {
  /** The path of textfile */
  path: string;
  /** Text data content */
  textFile: string;
}

export interface GameConfigDto {
  /** The name of the game */
  gameName: string;
  /** New game configuration */
  newConfig: string;
}

export interface UploadFilesDto {
  /** Target directory for the uploaded files */
  targetDirectory: string;
}

export interface MkDirDto {
  /** The source path where the directory will be created */
  source: string;
  /** Name for the new directory */
  name: string;
}

export interface DeleteFileOrDirDto {
  /** The source path of the file or directory to be deleted */
  source: string;
}

export interface RenameDto {
  /** The source path of the file or directory to be renamed */
  source: string;
  /** New name for renaming the file or directory */
  newName: string;
}

import type { AxiosInstance, AxiosRequestConfig, AxiosResponse, HeadersDefaults, ResponseType } from 'axios';
import axios from 'axios';

export type QueryParamsType = Record<string | number, any>;

export interface FullRequestParams extends Omit<AxiosRequestConfig, 'data' | 'params' | 'url' | 'responseType'> {
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

export type RequestParams = Omit<FullRequestParams, 'body' | 'method' | 'query' | 'path'>;

export interface ApiConfig<SecurityDataType = unknown> extends Omit<AxiosRequestConfig, 'data' | 'cancelToken'> {
  securityWorker?: (
    securityData: SecurityDataType | null,
  ) => Promise<AxiosRequestConfig | void> | AxiosRequestConfig | void;
  secure?: boolean;
  format?: ResponseType;
}

export enum ContentType {
  Json = 'application/json',
  FormData = 'multipart/form-data',
  UrlEncoded = 'application/x-www-form-urlencoded',
  Text = 'text/plain',
}

export class HttpClient<SecurityDataType = unknown> {
  public instance: AxiosInstance;
  private securityData: SecurityDataType | null = null;
  private securityWorker?: ApiConfig<SecurityDataType>['securityWorker'];
  private secure?: boolean;
  private format?: ResponseType;

  constructor({ securityWorker, secure, format, ...axiosConfig }: ApiConfig<SecurityDataType> = {}) {
    this.instance = axios.create({ ...axiosConfig, baseURL: axiosConfig.baseURL || '' });
    this.secure = secure;
    this.format = format;
    this.securityWorker = securityWorker;
  }

  public setSecurityData = (data: SecurityDataType | null) => {
    this.securityData = data;
  };

  protected mergeRequestParams(params1: AxiosRequestConfig, params2?: AxiosRequestConfig): AxiosRequestConfig {
    const method = params1.method || (params2 && params2.method);

    return {
      ...this.instance.defaults,
      ...params1,
      ...(params2 || {}),
      headers: {
        ...((method && this.instance.defaults.headers[method.toLowerCase() as keyof HeadersDefaults]) || {}),
        ...(params1.headers || {}),
        ...((params2 && params2.headers) || {}),
      },
    };
  }

  protected stringifyFormItem(formItem: unknown) {
    if (typeof formItem === 'object' && formItem !== null) {
      return JSON.stringify(formItem);
    } else {
      return `${formItem}`;
    }
  }

  protected createFormData(input: Record<string, unknown>): FormData {
    return Object.keys(input || {}).reduce((formData, key) => {
      const property = input[key];
      const propertyContent: any[] = property instanceof Array ? property : [property];

      for (const formItem of propertyContent) {
        const isFileType = formItem instanceof Blob || formItem instanceof File;
        formData.append(key, isFileType ? formItem : this.stringifyFormItem(formItem));
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
      ((typeof secure === 'boolean' ? secure : this.secure) &&
        this.securityWorker &&
        (await this.securityWorker(this.securityData))) ||
      {};
    const requestParams = this.mergeRequestParams(params, secureParams);
    const responseFormat = format || this.format || undefined;

    if (type === ContentType.FormData && body && body !== null && typeof body === 'object') {
      body = this.createFormData(body as Record<string, unknown>);
    }

    if (type === ContentType.Text && body && body !== null && typeof body !== 'string') {
      body = JSON.stringify(body);
    }

    return this.instance.request({
      ...requestParams,
      headers: {
        ...(requestParams.headers || {}),
        ...(type && type !== ContentType.FormData ? { 'Content-Type': type } : {}),
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
export class Api<SecurityDataType extends unknown> extends HttpClient<SecurityDataType> {
  api = {
    /**
     * No description
     *
     * @tags Test Server
     * @name AppControllerApiTest
     * @request GET:/api/test
     */
    appControllerApiTest: (params: RequestParams = {}) =>
      this.request<void, any>({
        path: `/api/test`,
        method: 'GET',
        ...params,
      }),

    /**
     * No description
     *
     * @tags LSP
     * @name LspControllerCompile
     * @summary Get code completions based on given input
     * @request POST:/api/lsp/compile
     */
    lspControllerCompile: (data: CompletionDto, params: RequestParams = {}) =>
      this.request<void, void>({
        path: `/api/lsp/compile`,
        method: 'POST',
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
      this.request<void, any>({
        path: `/api/manageGame/gameList`,
        method: 'GET',
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
    manageGameControllerCreateGame: (data: CreateGameDto, params: RequestParams = {}) =>
      this.request<void, any>({
        path: `/api/manageGame/createGame`,
        method: 'POST',
        body: data,
        type: ContentType.Json,
        ...params,
      }),
    
    /**
     * No description
     *
     * @tags Manage Template
     * @name ManageGameControllerGetGameList
     * @summary Retrieve template list
     * @request GET:/api/manageTemplate/templateList
     */
    manageGameControllerGetTemplateList: (params: RequestParams = {}) =>
      this.request<void, any>({
        path: `/api/manageTemplate/templateList`,
        method: 'GET',
        ...params,
      }),

    /**
     * No description
     *
     * @tags Manage Template
     * @name ManageGameControllerCreateGame
     * @summary Create a new template
     * @request POST:/api/manageTemplate/createTemplate
     */
    manageGameControllerCreateTemplate: (data: CreateTemplateDto, params: RequestParams = {}) =>
      this.request<void, any>({
        path: `/api/manageTemplate/createTemplate`,
        method: 'POST',
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
    manageGameControllerOpenGameDict: (gameName: string, params: RequestParams = {}) =>
      this.request<void, any>({
        path: `/api/manageGame/openGameDict/${gameName}`,
        method: 'GET',
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
        method: 'GET',
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
    manageGameControllerEjectGameAsWeb: (gameName: string, params: RequestParams = {}) =>
      this.request<void, any>({
        path: `/api/manageGame/ejectGameAsWeb/${gameName}`,
        method: 'GET',
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
    manageGameControllerEjectGameAsExe: (gameName: string, params: RequestParams = {}) =>
      this.request<void, any>({
        path: `/api/manageGame/ejectGameAsExe/${gameName}`,
        method: 'GET',
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
    manageGameControllerEjectGameAsAndroid: (gameName: string, params: RequestParams = {}) =>
      this.request<void, any>({
        path: `/api/manageGame/ejectGameAsAndroid/${gameName}`,
        method: 'GET',
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
    manageGameControllerReadGameAssets: (readDirPath: string, params: RequestParams = {}) =>
      this.request<void, any>({
        path: `/api/manageGame/readGameAssets/${readDirPath}`,
        method: 'GET',
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
    manageGameControllerEditFileName: (data: EditFileNameDto, params: RequestParams = {}) =>
      this.request<void, void>({
        path: `/api/manageGame/editFileName`,
        method: 'POST',
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
    manageGameControllerDeleteFile: (data: DeleteFileDto, params: RequestParams = {}) =>
      this.request<void, void>({
        path: `/api/manageGame/deleteFile`,
        method: 'POST',
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
    manageGameControllerCreateNewScene: (data: CreateNewSceneDto, params: RequestParams = {}) =>
      this.request<void, void>({
        path: `/api/manageGame/createNewScene`,
        method: 'POST',
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
    manageGameControllerEditScene: (data: EditSceneDto, params: RequestParams = {}) =>
      this.request<void, void>({
        path: `/api/manageGame/editScene`,
        method: 'POST',
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
    manageGameControllerEditTextFile: (data: EditTextFileDto, params: RequestParams = {}) =>
      this.request<void, void>({
        path: `/api/manageGame/editTextFile`,
        method: 'POST',
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
    manageGameControllerGetGameConfig: (gameName: string, params: RequestParams = {}) =>
      this.request<void, void>({
        path: `/api/manageGame/getGameConfig/${gameName}`,
        method: 'GET',
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
    manageGameControllerSetGameConfig: (data: GameConfigDto, params: RequestParams = {}) =>
      this.request<void, void>({
        path: `/api/manageGame/setGameConfig`,
        method: 'POST',
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
    manageGameControllerUploadFiles: (data: UploadFilesDto, params: RequestParams = {}) =>
      this.request<void, void>({
        path: `/api/manageGame/uploadFiles`,
        method: 'POST',
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
        method: 'POST',
        body: data,
        type: ContentType.Json,
        ...params,
      }),

    /**
     * No description
     *
     * @tags Manage Game
     * @name ManageGameControllerDeleteFileOrDir
     * @summary Delete File or Directory
     * @request POST:/api/manageGame/delete
     */
    manageGameControllerDeleteFileOrDir: (data: DeleteFileOrDirDto, params: RequestParams = {}) =>
      this.request<void, void>({
        path: `/api/manageGame/delete`,
        method: 'POST',
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
        method: 'POST',
        body: data,
        type: ContentType.Json,
        ...params,
      }),
  };
}
