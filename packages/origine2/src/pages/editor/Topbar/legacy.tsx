export const legacyTopbar = [];

// // 注册 Android svg 图标
// import {registerIcons} from "@fluentui/react/lib/Styling";
// import IconWrapper from "@/components/iconWrapper/IconWrapper";
// import AndroidIcon from "material-icon-theme/icons/android.svg";
// import GithubIcon from "@/pages/editor/Topbar/github.svg";
// import {ICommandBarItemProps} from "@fluentui/react";
// import {language} from "@/store/statusReducer";
// import axios from "axios";
// import {origineStore} from "@/store/origineStore";
//
// registerIcons({
//   icons: {
//     AndroidLogo: <IconWrapper src={AndroidIcon}/>,
//     GitHub: <IconWrapper src={GithubIcon}/>
//   }
// });
//
// const _items: ICommandBarItemProps[] = [
//   {
//     key: "source",
//     text: t('commandBar.items.source'),
//     cacheKey: "source", // changing this key will invalidate this item's cache
//     onClick: () => {
//       window.open("https://github.com/MakinoharaShoko/WebGAL_Terre", "_blank");
//     },
//     iconProps: {iconName: "GitHub"}
//   },
//   {
//     key: "language",
//     text: t('commandBar.items.language.text'),
//     cacheKey: 'language',
//     iconProps: {iconName: 'LocaleLanguage'},
//     subMenuProps: {
//       items: [
//         {
//           key: 'zhCn',
//           text: '简体中文',
//           onClick() {
//             setLanguage(language.zhCn);
//           }
//         },
//         {
//           key: 'en',
//           text: 'English',
//           onClick() {
//             setLanguage(language.en);
//           }
//         },
//         {
//           key: 'jp',
//           text: '日本語',
//           onClick() {
//             setLanguage(language.jp);
//           }
//         }
//       ]
//     }
//   },
//
//   {
//     key: "help",
//     text: t('commandBar.items.help.text'),
//     cacheKey: "help", // changing this key will invalidate this item's cache
//     onClick: () => {
//       window.open("https://docs.openwebgal.com/", "_blank");
//     },
//     iconProps: {iconName: "DocumentSearch"}
//   },
//
//   {
//     key: "release",
//     text: t('commandBar.items.release.text'),
//     cacheKey: "release", // changing this key will invalidate this item's cache
//     iconProps: {iconName: "PublishContent"},
//     subMenuProps: {
//       items: [
//         {
//           key: "export-as-web",
//           text: t('commandBar.items.release.items.web'),
//           iconProps: {iconName: "Globe"},
//           onClick: () => {
//             axios.get(`/api/manageGame/ejectGameAsWeb/${origineStore.getState().status.editor.currentEditingGame}`);
//           }
//         },
//         {
//           key: "export as exe",
//           text: t('commandBar.items.release.items.exe'),
//           iconProps: {iconName: "Devices2"},
//           onClick: () => {
//             axios.get(`/api/manageGame/ejectGameAsExe/${origineStore.getState().status.editor.currentEditingGame}`);
//           }
//         },
//         {
//           key: "export as android",
//           text: t('commandBar.items.release.items.android'),
//           iconProps: {iconName: "AndroidLogo"},
//           onClick: () => {
//             axios.get(`/api/manageGame/ejectGameAsAndroid/${origineStore.getState().status.editor.currentEditingGame}`);
//           }
//         }
//       ]
//     }
//   }];

// const legacy = <>
//   <a href="/" className={styles.home_btn}>
//     <LeftSmall theme="outline" size="24"/>
//     <div className={styles.editor_title}>WebGAL Terre</div>
//   </a>
//
//   <div className={styles.editor_editingGame}>{t('editing')}<span style={{ fontWeight: "bold" }}>{editingGame}</span></div>
//   <div style={{ display: "flex", justifyItems: "center", padding: '0 0 0 12px' }}>
//     <TerreToggle
//       isChecked={isCodeMode}
//       title={t('editMode.title')} onText={t('editMode.onText')} offText={t('editMode.offText')}
//       onChange={handleChange} />
//   </div>
//
//   <div style={{ margin: "0 5px 0 auto" }}>
//     <CommandBar
//       items={_items}
//       ariaLabel="Inbox actions"
//       primaryGroupAriaLabel="Email actions"
//       farItemsGroupAriaLabel="More actions"
//     />
//   </div></>;
