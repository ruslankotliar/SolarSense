import Link from 'next/link';

import Container from '@components/Container';

import styles from './Header.module.scss';

const Header = () => {
  return (
    <header className={styles.header}>
      <Container className={styles.headerContainer}>
        <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
          <p className={styles.headerTitle}>
            <Link href="/">
              Solar Sense
            </Link>
          </p>

          <p className={styles.headerSubtitle}>
            <Link href="/charts">
              Charts
            </Link>
          </p>
        </div>

        <p className={styles.headerSubtitle}>
          <Link href="/">
            Vienna | NASA Space Apps Challenge 2024
          </Link>
        </p>
      </Container>
    </header>
  );
};

export default Header;
