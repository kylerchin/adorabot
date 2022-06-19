import { isUndefined } from "lodash";

export const lookuptable = {
    "pinginit": {
        "en": "핑?",
        "ko": "Ping?"
    },
    "ping1": {
        "en": "**Pong!** If the Latency is significantly higher than the API Latency, the bot is likely ratelimited in this channel or guild.",
        "ko": "지연 시간이 API 지연 시간보다 훨씬 높으면 봇이 이 채널이나 길드에서 비율이 제한될 수 있습니다."
    },
    "shardnum": {
        "ko": "샤드 #",
        "en": "Shard #"
    },
    "latency": {
        "ko": "레이턴시",
        "en": "Latency",
        "zh-CN": "延迟"
    },
    "wslatency": {
        "ko": "웹소켓 API 레이턴시",
        "en": "Websocket API Latency",
        "zh-CN": "Websocket 应用程序接口 延迟"
    },
    "ms": {
        "ko": "밀리초",
        "en": "ms"
    },
    "views": {
        "ko": "조회수",
        "en": "Views",
        "zn-CN": "次观看"
    },
    "likes": {
        "ko": "좋아요",
        "en": "Likes",
        "zn-CN": "顶一下"
    },
    "dislikes": {
        "ko": "싫어요",
        "en": "Dislikes",
        "zh-CN": "踩一下"
    },
    "comments": {
        "ko": "댓글",
        "en": "Comments",
        "zn-CN": "条评论"
    },
    "publishedat": {
    "en": "Published at",        
    "ko": "발행일"
    },
    "monthchar": {
        "en": "월",
        "ko": "월",
        "ja": "月",
        "zh-CN": "月",
        "zh-TW": "月"
    }
}

interface lookupoptions {
    locale?:string;
    key: string;
}

export function lookuplocale(lookupopt) {
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