import { redirect } from '@remix-run/server-runtime';
import { parse } from 'cookie';
import { decode } from 'jsonwebtoken';


export const extractHankoCookie = (request: Request) => {
    const cookies = parse(request.headers.get('Cookie') || '');
    return cookies.hanko;
};


// ensures the user has a hanko cookie but does not check if it is valid
export async function requireHankoId(request: Request) {
    const hankoCookie = extractHankoCookie(request);
    const decoded = decode(hankoCookie);
    const hankoId = decoded?.sub;
    if (!hankoId || typeof hankoId !== "string")
        throw redirect(`/`);
    return hankoId;
}
