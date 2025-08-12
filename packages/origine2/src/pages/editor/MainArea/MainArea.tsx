import TagsManager from './TagsManager';
import EditArea from './EditArea';
import styles from './mainArea.module.scss';

export default function MainArea() {
  return (
    <div className={styles.MainArea_main}>
      <TagsManager />
      <EditArea />
    </div>
  );
}
