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