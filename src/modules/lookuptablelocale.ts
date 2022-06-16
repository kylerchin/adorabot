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
        "en": "Latency"
    },
    "wslatency": {
        "ko": "웹소켓 API 레이턴시",
        "en": "Websocket API Latency"
    },
    "ms": {
        "ko": "밀리초",
        "en": "ms"
    }
}

interface lookupoptions {
    locale?:string;
    key: string;
}

export function lookuplocale(lookupopt) {
    if (lookuptable[lookupopt.key]) {
        if (lookupopt.locale === null || lookupopt.locale === undefined) {
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