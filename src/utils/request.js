import axios from 'axios'
export const request = axios.create({
    baseURL: process.env.NODE_ENV === 'production'?'https://api.github.com/':'/api',
    timeout: 10000 // 超时时间
})

export const requestWithNoBaseUrl = axios.create({
    timeout: 10000 // 超时时间
})

