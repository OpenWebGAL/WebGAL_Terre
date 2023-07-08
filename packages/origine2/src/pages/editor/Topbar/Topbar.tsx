import styles from "./topbar.module.scss";
import { useDispatch, useSelector } from "react-redux";
import { origineStore, RootState } from "../../../store/origineStore";
import { LeftSmall } from "@icon-park/react";
import { CommandBar, ICommandBarItemProps } from "@fluentui/react";
import { registerIcons } from "@fluentui/react/lib/Styling";
import { AndroidLogoIcon } from "@fluentui/react-icons-mdl2";
import axios from "axios";
import { language, setEditMode } from "../../../store/statusReducer";
import TerreToggle from "../../../components/terreToggle/TerreToggle";
import useTrans from "@/hooks/useTrans";
import useLanguage from "@/hooks/useLanguage";
import IconWrapper from "@/components/iconWrapper/IconWrapper";
import AndroidIcon from 'material-icon-theme/icons/android.svg';
import GithubIcon from './github.svg';

export default function TopBar() {
  const t = useTrans('editor.topBar.');
  const setLanguage = useLanguage();
  const editingGame: string = useSelector((state: RootState) => state.status.editor.currentEditingGame);

  const isCodeMode = useSelector((state: RootState) => state.status.editor.isCodeMode); // false 是脚本模式 true 是图形化模式
  const dispatch = useDispatch();

  const handleChange = (newValue: boolean) => {
    dispatch(setEditMode(newValue));
  };

  // 注册 Android svg 图标
  registerIcons({
    icons: {
      AndroidLogo: <IconWrapper src={AndroidIcon}/>,
      GitHub: <IconWrapper src={GithubIcon}/>
    }
  });

  const _items: ICommandBarItemProps[] = [
    {
      key: "source",
      text: t('commandBar.items.source'),
      cacheKey: "source", // changing this key will invalidate this item's cache
      onClick: () => {
        window.open("https://github.com/MakinoharaShoko/WebGAL_Terre", "_blank");
      },
      iconProps: { iconName: "GitHub" }
    },
    {
      key: "language",
      text: t('commandBar.items.language.text'),
      cacheKey: 'language',
      iconProps: { iconName: 'LocaleLanguage'},
      subMenuProps: {
        items: [
          {
            key: 'zhCn',
            text: '简体中文',
            onClick() {setLanguage(language.zhCn);}
          },
          {
            key: 'en',
            text: 'English',
            onClick() {setLanguage(language.en);}
          },
          {
            key: 'jp',
            text: '日本語',
            onClick() {setLanguage(language.jp);}
          }
        ]
      }
    },

    {
      key: "help",
      text: t('commandBar.items.help.text'),
      cacheKey: "help", // changing this key will invalidate this item's cache
      onClick: () => {
        window.open("https://docs.openwebgal.com/guide/", "_blank");
      },
      iconProps: { iconName: "DocumentSearch" }
    },

    {
      key: "release",
      text: t('commandBar.items.release.text'),
      cacheKey: "release", // changing this key will invalidate this item's cache
      iconProps: { iconName: "PublishContent" },
      subMenuProps: {
        items: [
          {
            key: "export-as-web",
            text: t('commandBar.items.release.items.web'),
            iconProps: { iconName: "Globe" },
            onClick: () => {
              axios.get(`/api/manageGame/ejectGameAsWeb/${origineStore.getState().status.editor.currentEditingGame}`);
            }
          },
          {
            key: "export as exe",
            text: t('commandBar.items.release.items.exe'),
            iconProps: { iconName: "Devices2" },
            onClick: () => {
              axios.get(`/api/manageGame/ejectGameAsExe/${origineStore.getState().status.editor.currentEditingGame}`);
            }
          },
          {
            key: "export as android",
            text: t('commandBar.items.release.items.android'),
            iconProps: { iconName: "AndroidLogo" },
            onClick: () => {
              axios.get(`/api/manageGame/ejectGameAsAndroid/${origineStore.getState().status.editor.currentEditingGame}`);
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

    <div className={styles.editor_editingGame}>{t('editing')}<span style={{ fontWeight: "bold" }}>{editingGame}</span></div>
    <div style={{ display: "flex", justifyItems: "center", padding: '0 0 0 12px' }}>
      <TerreToggle
        isChecked={isCodeMode}
        title={t('editMode.title')} onText={t('editMode.onText')} offText={t('editMode.offText')}
        onChange={handleChange} />
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
