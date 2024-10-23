import { request, requestWithNoBaseUrl } from "../utils/request.js";
import {useSettingsStore} from "../stores/settingsData.js";


export function getContents() {
    const mSettingsStore = useSettingsStore();

    return request({
        url:`/repos/${mSettingsStore.githubSettings.name}/${mSettingsStore.githubSettings.repo}/contents/`,
        headers:{
            "Accept":`application/vnd.github+json`,
            "Authorization":`Bearer ${mSettingsStore.githubSettings.token}`,
            "X-GitHub-Api-Version": `2022-11-28`,
            "Cache-Control": "no-cache",
        },
        method:'get'
    })
}

export function upload(name, data) {
    const mSettingsStore = useSettingsStore();

    return request({
        url:`/repos/${mSettingsStore.githubSettings.name}/${mSettingsStore.githubSettings.repo}/contents/`+name,
        headers:{
            "Accept":`application/vnd.github+json`,
            "Authorization":`Bearer ${mSettingsStore.githubSettings.token}`,
            "X-GitHub-Api-Version": `2022-11-28`
        },
        method:'put',
        data: data
    })
}

export function getGist() {
    const mSettingsStore = useSettingsStore();

    return request({
        url:'/gists',
        headers:{
            "Accept":`application/vnd.github+json`,
            "Authorization":`Bearer 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`,
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



export function getRaw(url) {
    return requestWithNoBaseUrl({
        url: url,
        method: 'get'
    })
}

