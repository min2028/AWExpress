import {useRouter} from "next/router";
import {useEffect} from "react";

export default function Home() {
    const router = useRouter();

    useEffect(() => {
        router.replace("/home");
    }, [])

    return (
        <></>
    )
}

export async function getServerSideProps(context) {

    return {
        redirect: {
            destination: '/home',
            permanent: false,
        }
    }
}
