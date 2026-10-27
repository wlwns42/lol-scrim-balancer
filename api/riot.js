// Vercel Serverless Function: Riot Games Official API Proxy
export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const { name, tag } = req.query;
  const RIOT_API_KEY = process.env.RIOT_API_KEY || "RGAPI-a6320551-eb63-4c17-ad45-75ce5332f201";

  if (!name || !tag) {
    return res.status(400).json({ error: "소환사명과 태그가 필요합니다." });
  }

  try {
    const accountRes = await fetch(
      `https://asia.api.riotgames.com/riot/account/v1/accounts/by-riot-id/${encodeURIComponent(name)}/${encodeURIComponent(tag)}?api_key=${RIOT_API_KEY}`
    );
    
    if (!accountRes.ok) {
      return res.status(accountRes.status).json({ error: `라이엇 계정 조회 실패 (${accountRes.status})` });
    }
    const accountData = await accountRes.json();
    const puuid = accountData.puuid;

    const leagueRes = await fetch(
      `https://kr.api.riotgames.com/lol/league/v4/entries/by-puuid/${puuid}?api_key=${RIOT_API_KEY}`
    );
    const leagueData = await leagueRes.json();

    let soloRank = null;
    let flexRank = null;

    if (Array.isArray(leagueData)) {
      leagueData.forEach(entry => {
        if (entry.queueType === 'RANKED_SOLO_5x5') {
          soloRank = {
            tier: entry.tier,
            rank: entry.rank,
            lp: entry.leaguePoints,
            wins: entry.wins,
            losses: entry.losses,
            totalGames: entry.wins + entry.losses,
            winRate: Math.round((entry.wins / (entry.wins + entry.losses)) * 100)
          };
        } else if (entry.queueType === 'RANKED_FLEX_SR') {
          flexRank = {
            tier: entry.tier,
            rank: entry.rank,
            lp: entry.leaguePoints,
            wins: entry.wins,
            losses: entry.losses,
            totalGames: entry.wins + entry.losses,
            winRate: Math.round((entry.wins / (entry.wins + entry.losses)) * 100)
          };
        }
      });
    }

    const masteryRes = await fetch(
      `https://kr.api.riotgames.com/lol/champion-mastery/v4/champion-masteries/by-puuid/${puuid}/top?count=3&api_key=${RIOT_API_KEY}`
    );
    const masteryData = await masteryRes.json();

    const CHAMP_MAP = {
      "1": "애니", "2": "올라프", "3": "갈리오", "4": "트위스티드 페이트", "5": "신 짜오", "6": "우르곳", "7": "르블랑",
      "8": "블라디미르", "9": "피들스틱", "10": "케일", "11": "마스터 이", "12": "알리스타", "13": "라이즈", "14": "사이온",
      "15": "시비르", "16": "소라카", "17": "티모", "18": "트리스타나", "19": "워윅", "20": "누누", "21": "미스 포츈",
      "22": "애쉬", "23": "트린다미어", "24": "잭스", "25": "모르가나", "26": "질리언", "27": "신지드", "28": "이블린",
      "29": "트위치", "30": "카서스", "31": "초가스", "32": "아무무", "33": "람머스", "34": "애니비아", "35": "샤코",
      "36": "문도 박사", "37": "소나", "38": "카사딘", "39": "이렐리아", "40": "잔나", "41": "갱플랭크", "42": "코르키",
      "43": "카르마", "44": "타릭", "45": "베이가", "48": "트런들", "50": "스웨인", "51": "케이틀린", "53": "블리츠크랭크",
      "54": "말파이트", "55": "카타리나", "56": "녹턴", "57": "마오카이", "58": "레넥톤", "59": "자르반 4세", "60": "엘리스",
      "61": "오리아나", "62": "오공", "63": "브랜드", "64": "리 신", "67": "베인", "68": "럼블", "69": "카시오페아",
      "72": "스카너", "74": "하이머딩거", "75": "나서스", "76": "니달리", "77": "우디르", "78": "뽀삐", "79": "그라가스",
      "80": "판테온", "81": "이즈리얼", "82": "모데카이저", "83": "요릭", "84": "아칼리", "85": "케넨", "86": "가렌",
      "89": "레오나", "90": "말자하", "91": "탈론", "92": "리븐", "96": "코그모", "98": "쉔", "99": "럭스",
      "101": "제라스", "102": "쉬바나", "103": "아리", "104": "그레이브즈", "105": "피즈", "106": "볼리베어", "107": "렝가",
      "110": "바루스", "111": "노틸러스", "112": "빅토르", "113": "세주아니", "114": "피오라", "115": "직스", "117": "룰루",
      "119": "드레이븐", "120": "헤카림", "121": "카직스", "122": "다리우스", "126": "제이스", "127": "리산드라", "131": "다이애나",
      "133": "퀸", "134": "신드라", "136": "아우렐리온 솔", "141": "케인", "142": "조이", "143": "자이라", "145": "카이사",
      "147": "세라핀", "150": "나르", "154": "자크", "157": "야스오", "161": "벨코즈", "163": "탈리야", "164": "카밀",
      "166": "아크샨", "200": "벨베스", "201": "브라움", "202": "진", "203": "킨드레드", "221": "제리", "222": "징크스",
      "223": "탐 켄치", "233": "브라이어", "234": "비에고", "235": "세나", "236": "루시안", "238": "제드", "240": "클레드",
      "245": "에코", "246": "키아나", "254": "바이", "266": "아트록스", "267": "나미", "268": "아지르", "350": "유미",
      "360": "사미라", "412": "쓰레쉬", "420": "일라오이", "421": "렉사이", "427": "아이번", "429": "칼리스타", "432": "바드",
      "497": "라칸", "498": "자야", "516": "오른", "517": "사일러스", "518": "니코", "523": "아펠리오스", "526": "렐",
      "555": "파이크", "711": "벡스", "777": "요네", "875": "세트", "876": "릴리아", "888": "레나타 글라스크", "895": "스몰더",
      "897": "크산테", "902": "밀리오", "910": "흐웨이", "950": "나피리"
    };

    const mostChamps = Array.isArray(masteryData) 
      ? masteryData.map(m => CHAMP_MAP[m.championId.toString()] || `챔피언(${m.championId})`)
      : [];

    return res.status(200).json({
      name: `${accountData.gameName}#${accountData.tagLine}`,
      soloRank,
      flexRank,
      mostChamps
    });

  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}
