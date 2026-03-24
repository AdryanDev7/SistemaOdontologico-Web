import styles from './Header.module.css';

export function Header() {
    return (
        <header className={styles.container}>
            <h2 className={styles.titulo}>🦷 Clínica Dra.Elisa</h2>
        </header>
    )
}