import * as React from 'react';
import Pagination from '@mui/material/Pagination';
import Stack from '@mui/material/Stack';
import { useRouter } from 'next/router';


export default function ProductPagination(props) {
    let router = useRouter()
    return (
        <Stack spacing={2}>
        <Pagination 
            count={props.numOfPages} 
            color="primary"
            size='medium'
            siblingCount={1}
            onChange={(event, page) => {
                router.push({
                    pathname: '/home',
                    query: {...props.searchParameters, page: page}
                })
            }}
            />
        </Stack>
    );
}