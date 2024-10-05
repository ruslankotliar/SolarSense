import dynamic from 'next/dynamic';
import styles from '@styles/Home.module.scss';

const DynamicMap = dynamic(() => import('./DynamicMap'), {
  ssr: false
});

const Map = (props) => {
  return (
    <div className={styles.mapWrapper}>
      <DynamicMap {...props} />
    </div>
  )
}

export default Map;