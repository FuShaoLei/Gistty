export const parseTag = (text) => {

    if (text !== undefined && text !== null) {
        const matchData = text.match(/#([\w\u4e00-\u9fa5]+)/g);
        if(matchData !== null) {
            let tags = matchData.map(tag => tag.slice(1));
            return tags.length > 0 ? tags : []
        }
    } else {
        return [];
    }

}

export const removeTags = (text) => {
    if (text !== undefined && text !== null) {
        // 匹配所有的标签
        const resultText = text.replace(/#([\w\u4e00-\u9fa5]+)/g, '');
        // 返回去除标签后的文本
        return resultText.trim();
    }
    return '';
}
