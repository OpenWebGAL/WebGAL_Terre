import styles from "./topbar.module.scss";
import { useDispatch, useSelector } from "react-redux";
import { origineStore, RootState } from "../../../store/origineStore";
import { LeftSmall } from "@icon-park/react";
import { CommandBar, ICommandBarItemProps, Toggle } from "@fluentui/react";
import axios from "axios";
import { setEditMode } from "../../../store/statusReducer";

export default function TopBar() {
  const editingGame: string = useSelector((state: RootState) => state.status.editor.currentEditingGame);

  const isCodeMode = useSelector((state: RootState) => state.status.editor.isCodeMode); // false 是脚本模式 true 是图形化模式
  const dispatch = useDispatch();

  const handleChange = (newValue: boolean) => {
    dispatch(setEditMode(newValue));
  };

  const _items: ICommandBarItemProps[] = [
    {
      key: "help",
      text: "制作指南",
      cacheKey: "help", // changing this key will invalidate this item's cache
      onClick: () => {
        window.open("https://docs.msfasr.com/guide/", "_blank");
      },
      iconProps: { iconName: "DocumentSearch" }
    },

    {
      key: "release",
      text: "导出游戏",
      cacheKey: "release", // changing this key will invalidate this item's cache
      iconProps: { iconName: "PublishContent" },
      subMenuProps: {
        items: [
          {
            key: "export-as-web",
            text: "导出为网页",
            iconProps: { iconName: "Globe" },
            onClick: () => {
              axios.get(`/api/manageGame/ejectGameAsWeb/${origineStore.getState().status.editor.currentEditingGame}`);
            }
          },
          {
            key: "export as exe",
            text: "导出为可执行文件",
            iconProps: { iconName: "WindowsLogo" },
            onClick: () => {
              axios.get(`/api/manageGame/ejectGameAsExe/${origineStore.getState().status.editor.currentEditingGame}`);
            }
          }
        ]
      }
    }];

  return <div className={styles.editor_topbar}>
    <a href="/" className={styles.home_btn}>
      <LeftSmall theme="outline" size="24" fill="#005caf" />
      <div className={styles.editor_title}>WebGAL Origine</div>
    </a>

    <div className={styles.editor_editingGame}>正在编辑：<span style={{ fontWeight: "bold" }}>{editingGame}</span></div>
    <div style={{ display: "flex", justifyItems: "center" }}>
      <Toggle styles={{ root: { margin: "0 0 0 6px" } }}
        checked={isCodeMode}
        label="编辑模式" inlineLabel onText="脚本编辑模式" offText="图形编辑模式"
        onChange={(event, checked) => handleChange(checked ?? false)} />
    </div>

    <div style={{ margin: "0 5px 0 auto" }}>
      <CommandBar
        items={_items}
        ariaLabel="Inbox actions"
        primaryGroupAriaLabel="Email actions"
        farItemsGroupAriaLabel="More actions"
      />
    </div>
  </div>;
}
