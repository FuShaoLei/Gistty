import { request, requestWithNoBaseUrl } from "../utils/request.js";
import {useSettingsStore} from "../stores/settingsData.js";

export function getGist() {
    const mSettingsStore = useSettingsStore();

    return request({
        url:'/gists',
        headers:{
            "Accept":`application/vnd.github+json`,
            "Authorization":`Bearer ${mSettingsStore.loginData.token}`,
            "X-GitHub-Api-Version": `2022-11-28`,
            "Cache-Control": "no-cache",
        },
        method:'get'
    })
}

export function getStarGist() {
    const mSettingsStore = useSettingsStore();

    return request({
        url:'/gists/starred',
        headers:{
            "Accept":`application/vnd.github+json`,
            "Authorization":`Bearer ${mSettingsStore.loginData.token}`,
            "X-GitHub-Api-Version": `2022-11-28`,
            "Cache-Control": "no-cache",
        },
        method:'get'
    })
}

export function CreateGist(data) {
    const mSettingsStore = useSettingsStore();

    return request({
        url:'/gists',
        headers:{
            "Accept":`application/vnd.github+json`,
            "Authorization":`Bearer ${mSettingsStore.loginData.token}`,
            "X-GitHub-Api-Version": `2022-11-28`
        },
        method:'post',
        data: data
    })
}

export function UpdateGist(data) {
    const mSettingsStore = useSettingsStore();

    return request({
        url:`/gists/${data.gist_id}`,
        headers:{
            "Accept":`application/vnd.github+json`,
            "Authorization":`Bearer ${mSettingsStore.loginData.token}`,
            "X-GitHub-Api-Version": `2022-11-28`
        },
        method:'patch',
        data: data
    })
}

export function DeleteGist(data) {
    const mSettingsStore = useSettingsStore();

    return request({
        url:`/gists/${data.id}`,
        headers:{
            "Accept":`application/vnd.github+json`,
            "Authorization":`Bearer ${mSettingsStore.loginData.token}`,
            "X-GitHub-Api-Version": `2022-11-28`
        },
        method:'delete'
    })
}


export function getRaw(url) {
    return requestWithNoBaseUrl({
        url: url,
        method: 'get'
    })
}

