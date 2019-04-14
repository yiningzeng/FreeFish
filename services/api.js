import request from '../utils/request';
import { stringify } from 'qs';

const ip="vps.yining.site:8080";//"10.50.102.166";
export async function getFishs(params) {
    console.log("getFishs"+JSON.stringify(params));
    return request(`http://${ip}/api/v1/fishs/list?${stringify(params)}`, {
        headers: {authorization: 'free_fish'},
        method: 'GET',
    });
}
export async function getAppointKey() {
    return request(`http://${ip}/api/v1/fishs/keys`,{
        headers: {authorization: 'free_fish'},
        method: 'GET',
    });
}

export async function updateFishStatus(params) {
    return request(`http://${ip}/api/v1/fishs/${params.id}`,{
        method: 'PATCH',
        body:stringify(params),
        headers:{
            authorization: 'free_fish',
            'Content-Type':'application/x-www-form-urlencoded',
        },
    });
}

export async function delFish(params) {
    return request(`http://${ip}/api/v1/fishs/${params.id}`,{
        method: 'DELETE',
        headers:{
            authorization: 'free_fish',
        },
    });
}
