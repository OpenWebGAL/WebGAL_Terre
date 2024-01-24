import {useValue} from "../../../../../hooks/useValue";
import {useEffect, useState} from "react";
import {useDispatch, useSelector} from "react-redux";
import {RootState} from "../../../../../store/origineStore";
import axios from "axios";
import {IFileInfo} from "webgal-terre-2/dist/Modules/webgal-fs/webgal-fs.service";
import FileElement from "../../sidebarComponents/FileElement";
import {ITag, statusActions} from "../../../../../store/statusReducer";
import useTrans from "@/hooks/useTrans";
import TagTitleWrapper from "@/components/TagTitleWrapper/TagTitleWrapper";
import {Newlybuild} from "@icon-park/react";
import s from './sceneTab.module.scss';
import { Button, Input, Popover, PopoverSurface, PopoverTrigger, Text } from "@fluentui/react-components";

export default function Scenes() {
  const t = useTrans('editor.sideBar.scenes.');

  const state = useSelector((state: RootState) => state.status.editor);
  const dispatch = useDispatch();
  const currentGameName = state.currentEditingGame;
  // 场景文件的列表
  const sceneList = useValue<IFileInfo[]>([]);

  const [errorMessage, setErrorMessage] = useState<string>('');

  // 处理新建场景的问题
  const showCreateSceneCallout = useValue(false);
  const newSceneName = useValue("");

  const createNewScene = async () => {
    if (newSceneName.value && newSceneName.value.length !==0){
      const gameName = state.currentEditingGame;
      const params = new URLSearchParams();

      params.append("gameName", gameName);
      params.append("sceneName", newSceneName.value);

      axios.post("/api/manageGame/createNewScene/", params)
        .then(() => {
          showCreateSceneCallout.set(false);
          updateSceneListView();
          newSceneName.set("");
        })
        .catch(() => {
          setErrorMessage(t('dialogs.create.sceneExisted'));
        });
    }
  };

  // 请求场景文件的函数
  async function getSceneList() {
    const url = `/api/manageGame/readGameAssets/${currentGameName}/game/scene`;
    const rawSceneList: IFileInfo[] = await axios.get(url).then((r) => r.data.dirInfo);
    return rawSceneList.filter((e: any) => e.extName === ".txt");
  }

  function updateSceneListView() {
    getSceneList().then((result) => {
      sceneList.set(result);
    });
  }

  // 准备请求场景文件
  useEffect(() => {
    updateSceneListView();
  }, []);

  // 更新文件名的函数
  function constructUpdateFilenameFunc(oldPath: string) {
    return function (newFilename: string) {
      const params = new URLSearchParams();
      params.append("path", oldPath);
      params.append("newName", newFilename);
      axios.post("/api/manageGame/editFilename/", params).then(updateSceneListView);
    };
  }

  // 删除文件的函数
  function constructDeleteFileFunc(path: string) {
    return function () {
      const params = new URLSearchParams();
      params.append("path", path);
      axios.post("/api/manageGame/deleteFile/", params).then(updateSceneListView);
    };
  }

  // 添加 Tag 的函数
  function addEditTag(name: string, target: string) {
    const tag: ITag = {tagName: name, tagTarget: target, tagType: "scene"};
    // 先要确定没有这个tag
    const result = state.tags.findIndex((e) => e.tagTarget === target);
    if (result < 0) dispatch(statusActions.addEditAreaTag(tag));
    dispatch(statusActions.setCurrentTagTarget(target));
  }

  const showSceneList = sceneList.value.map((singleFile) => {
    return (
      <FileElement
        clickCallback={() => addEditTag(singleFile.name, singleFile.path)}
        name={singleFile.name}
        key={singleFile.name}
        deleteCallback={constructDeleteFileFunc(singleFile.path)}
        editFileNameCallback={constructUpdateFilenameFunc(singleFile.path)}
        undeletable={singleFile.name === 'start.txt'}
      />
    );
  });

  return (
    <div style={{height: "100%", overflow: "auto"}}>
      <TagTitleWrapper 
        title=""
        extra={
          <Popover
            withArrow
            open={showCreateSceneCallout.value}
            onOpenChange={() => showCreateSceneCallout.set(!showCreateSceneCallout.value)}
          >
            <PopoverTrigger>
              <div
                id="createSceneButton"
                className={s.tag_title_button}
              >
                <Newlybuild
                  theme="outline"
                  size="16"
                  style={{paddingRight: 4, transform: 'translate(0,1px)'}}
                  fill="#FFFFFF"
                  strokeWidth={4}
                />
                {t('dialogs.create.button')}
              </div>
            </PopoverTrigger>
            <PopoverSurface>
              <Text as="h3" block size={500}>
                {t('dialogs.create.title')}
              </Text>
              <div>
                <Input
                  value={newSceneName.value}
                  onChange={(e)=> newSceneName.set(e.target.value)}
                  placeholder={t('dialogs.create.text')}
                  onKeyDown={(event) => (event.key === "Enter") && createNewScene()}
                />
              </div>
              <div style={{display: "flex", justifyContent: "center", padding: "5px 0 5px 0"}}>
                <Button appearance="primary" onClick={createNewScene}>{t('$common.create')}</Button>
              </div>
            </PopoverSurface>
          </Popover>
        }
      />
      <div style={{overflow: "auto", maxHeight: "calc(100% - 35px)"}}>{showSceneList}</div>
    </div>
  );
}
