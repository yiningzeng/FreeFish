import request from '../utils/request';

const ip="pcbdemo.api.galileo-ai.com:7001";//"10.50.102.166";
export async function openS(port) {
  return request(`http://${ip}/pcb/service/${port}/open/`,{
    method: 'GET',
  });
}
export async function closeS(port) {
    return request(`http://${ip}/pcb/service/${port}/close/`,{
        method: 'GET',
    });
}
export async function searchS(port) {
    return request(`http://${ip}/pcb/service/${port}/status/`,{
        method: 'GET',
    });
}
