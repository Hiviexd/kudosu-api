import styles from "./page.module.css";

export default function Home() {
    return (
        <main className={styles.main}>
            <h2>one day i'll make a proper frontend for this</h2>
            <div className={styles.description}>
                <i className={styles.header}>available routes</i>
                <span>/api/user/{"{osuId}"}</span>
                <span>/api/rank/{"{rank}"}</span>
                <span>/api/ranking/{"{page}"}</span>
            </div>
            <div className={styles.footer}>
                <div className={styles.outro}>
                    <span>made with 🤍 by</span>
                    <a
                        className={styles.link}
                        href="https://osu.ppy.sh/users/14102976"
                        target="_blank">
                        Hivie
                    </a>
                </div>
                <div className={styles.outro}>
                    <a
                        className={styles.link}
                        href="https://github.com/Hiviexd/kudosu-api"
                        target="_blank">
                        github repo
                    </a>
                </div>
            </div>
        </main>
    );
}
