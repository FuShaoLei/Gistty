import {defineStore} from 'pinia'


export const useSettingsStore = defineStore('settings', {
    state: () => {
        return {
            loginData: {
              token:""
            },
            githubSettings: {
                token: "",
                name: "",
                repo: "",
                branch: ""
            },
            otherSettings: {
                copyType: "origin" // "origin"
            }
        }
    },
    actions: {
        setGithubSettings(newGithubSettings) {
            this.githubSettings = newGithubSettings
        },
        setOtherSettings(newOtherSettings) {
            this.otherSettings = newOtherSettings
        },
        setLoginSettings(newLoginSettings) {
            this.loginData = newLoginSettings
        }
    },
    persist: true
})