import { Tooltip } from '@fluentui/react-components';
import { InfoRegular } from '@fluentui/react-icons';
import styles from './infoTip.module.scss';

/**
 * 需要解释的地方只放一个 info 图标，说明放在 tooltip 里
 */
export function InfoTip({ content }: { content: string }) {
  return (
    <Tooltip content={content} relationship="description" withArrow>
      <span className={styles.infoTip} tabIndex={0}>
        <InfoRegular />
      </span>
    </Tooltip>
  );
}
