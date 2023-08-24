import { isUndefined } from "lodash";

export const lookuptable = {
    "pinginit": {
        "en": "핑?",
        "ko": "Ping?"
    },
    "ping1": {
        "en": "**Pong!** If the Latency is significantly higher than the API Latency, the bot is likely ratelimited in this channel or guild.",
        "ko": "지연 시간이 API 지연 시간보다 훨씬 높으면 봇이 이 채널이나 길드에서 비율이 제한될 수 있습니다.",
        "fr": "**Pong!** Si la latence est nettement supérieure à la latence de l'API, le bot est probablement limité en débit dans ce canal ou cette guilde.",
        "ja": "**Pong!** もしレイテンシがAPIレイテンシよりも大きい場合、ボットはこのチャンネルまたはギルドでレート制限されている可能性があります。",
        "zh-CN": "**Pong!** 如果延迟明显高于API延迟，则机器人可能会在此频道或公会中限制速率。",
        "zh-TW": "**Pong!** 如果延遲明顯高於API延遲，則機器人可能會在此頻道或公會中限制速率。",
        "de": "**Pong!** Wenn die Latenz deutlich höher ist als die API-Latenz, ist der Bot wahrscheinlich in diesem Kanal oder in dieser Gilde ratenbegrenzt.",
    },
    "shardnum": {
        "ko": "샤드 #",
        "en": "Shard #",
        "zh-CN": "群号",
        "zh-TW": "群號",
        "fr": "Tesson #",
    },
    "latency": {
        "ko": "레이턴시",
        "en": "Latency",
        "zh-CN": "延迟",
        "zh-TW": "延遲",
        "fr": "Latence",
        "ja": "レイテンシー",
    },
    "wslatency": {
        "ko": "웹소켓 API 레이턴시",
        "en": "Websocket API Latency",
        "zh-CN": "Websocket 应用程序接口 延迟",
        "zh-TW": "Websocket 應用程序接口 延遲",
        "fr": "Latence de l'API Websocket",
        "ja": "Websocket API レイテンシー",
    },
    "ms": {
        "ko": "밀리초",
        "en": "ms",
        "zh-TW": "毫秒",
        "zh-CN": "毫秒"
    },
    "views": {
        "ko": "조회수",
        "en": "Views",
        "zh-CN": "次观看",
        "ja": "回視聴",
        "zh-TW": "次觀看",
        "de": "Aufrufe",
        "fr": "Vues"
    },
    "likes": {
        "ko": "좋아요",
        "en": "Likes",
        "zh-CN": "顶一下",
        "ja": "いいね！",
        "zh-TW": "頂一下",
        "de": "Mag ich",
        "fr": "aime"
    },
    "dislikes": {
        "ko": "싫어요",
        "en": "Dislikes",
        "zh-CN": "踩一下",
        "zh-TW": "踩一下",
        "de": "Gefällt mir nicht",
        "fr": "n'aime pas"
    },
    "comments": {
        "ko": "댓글",
        "en": "Comments",
        "zh-CN": "条评论",
        "ja": "コメント",
        "zh-TW": "條評論",
        "de": "Kommentare",
        "fr": "Commentaires"
    },
    "publishedat": {
    "en": "Published at",        
    "ko": "발행일",
    "ja": "発行日",
    "zh-CN": "出版日期",
    "zh-TW": "出版日期",
    "de": "Veröffentlichungsdatum",
    "fr": "Publiée le"
    },
    "monthchar": {
        "en": "Mo",
        "ko": "월",
        "ja": "月",
        "zh-CN": "月",
        "zh-TW": "月",
        "fr": "Mois"
    },
    "k": {
        "en": "K",
        "kr": "천",
        "zh-CN": "千",
        "zh-TW": "千"
    },
    "tenk": {
        "en": "0k",
        "kr": "만",
        "zh-CN": "万",
        "zh-TW": "萬"
    }
}

interface lookupoptions {
    locale?:string;
    key: string;
}

export function lookuplocale(lookupopt:lookupoptions) {
    if (lookuptable[lookupopt.key]) {
        if (lookupopt.locale === null || lookupopt.locale === undefined  || lookupopt.locale === "") {
            return lookuptable[lookupopt.key]["en"]
        }
       if (lookuptable[lookupopt.key][lookupopt.locale]) {
        return lookuptable[lookupopt.key][lookupopt.locale]
       } else {
        return lookuptable[lookupopt.key]["en"]
       }
    } else {
        return undefined;
    }
}