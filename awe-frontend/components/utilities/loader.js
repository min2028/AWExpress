import { RevolvingDot } from 'react-loader-spinner';
import CircularProgress from '@mui/material/CircularProgress';


/*
Props:
    contained=false
    size=40, 100
    color="#a8cac9", "#297575"
 */
export default function Loader(props) {

    if (props.contained) {
        return (
            <div style={{display: 'flex', alignContent: 'center', justifyContent: 'center', color: props.color ?? "#a8cac9"}}>
                <CircularProgress aria-label="loading" color="inherit" size={props.size ?? 40}/>
            </div>
        )
    } else {
        return(
            <div style={{position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%, -50%)'}}>
                <RevolvingDot height={props.size ?? 100} width={props.size ?? 100} color={props.color ?? "#297575"} aria-label="loading"/>
            </div>
        );
    }


}