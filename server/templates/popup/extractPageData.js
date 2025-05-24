// content/content.js

// ... (YOUTUBE_PATTERN, NAVER_NEWS_PATTERN 정의) ...

function extractPageData() {
    const currentUrl = window.location.href;
    const pageTitle = document.title || "제목 없음";

    console.log("content.js: extractPageData 함수 실행 시작. URL:", currentUrl); // 이 로그 확인

    let urlType = "unsupported";
    let extractedText = null;
    let isYoutube = false;
    let isNaverNews = false;

    if (YOUTUBE_PATTERN.test(currentUrl)) {
        urlType = "youtube";
        isYoutube = true;
        console.log("content.js: 유튜브 URL 감지.");
    } else if (NAVER_NEWS_PATTERN.test(currentUrl)) {
        urlType = "naver_news";
        isNaverNews = true;
        console.log("content.js: 네이버 뉴스 URL 감지.");

        // --- 네이버 뉴스 추출 로직 상세 디버깅 ---
        const titleElement = document.querySelector(".media_end_head_title");
        console.log("content.js: 네이버 뉴스 제목 요소:", titleElement); // 요소가 null인지 아닌지 확인
        const newsTitle = titleElement ? titleElement.innerText.trim() : pageTitle;
        console.log("content.js: 추출된 네이버 뉴스 제목:", newsTitle);

        const newsAreaElement = document.getElementById("dic_area");
        console.log("content.js: 네이버 뉴스 본문 요소:", newsAreaElement); // 요소가 null인지 아닌지 확인
        let newsArea = newsAreaElement ? newsAreaElement.innerText.trim() : null;

        if (newsArea) {
            newsArea = newsArea.replace(/\n/g, " ").replace(/\s\s+/g, " ").trim();
            console.log("content.js: 처리된 네이버 뉴스 본문 미리보기 (첫 100자):", newsArea.substring(0, 100));
        } else {
            console.log("content.js: 네이버 뉴스 본문 요소에서 텍스트 추출 실패.");
        }
        extractedText = newsTitle ? `<span class="math-inline">\{newsTitle\}\\n\\n</span>{newsArea}` : newsArea;
        if (newsTitle && newsTitle !== pageTitle) {
            pageTitle = newsTitle;
        }
        // --- 네이버 뉴스 추출 로직 상세 디버깅 끝 ---
    } else {
        urlType = "general_webpage";
        console.log("content.js: 일반 웹페이지 감지.");
        const selectors = ["article", "main", "div.article-body", "section", "body"];
        let foundSelector = false;
        for (const selector of selectors) {
            const el = document.querySelector(selector);
            console.log(`content.js: '${selector}' 셀렉터 시도, 요소:`, el); // 각 셀렉터 시도 결과 확인
            if (el && el.innerText && el.innerText.length > 200) {
                extractedText = el.innerText.trim();
                foundSelector = true;
                console.log(`content.js: '${selector}'에서 충분한 본문 추출.`);
                break;
            }
        }
        if (!foundSelector) {
            console.log("content.js: 모든 일반 셀렉터에서 충분한 본문 찾기 실패.");
        }

        if (extractedText && extractedText.length < 50) {
            // 기준을 50으로 낮춰서 쉽게 확인
            extractedText = "페이지에서 충분한 본문을 찾을 수 없습니다.";
        } else if (!extractedText) {
            extractedText = "페이지에서 본문을 찾을 수 없습니다.";
        }
    }

    console.log("content.js: extractPageData 함수 종료. 반환 데이터:", {
        urlType,
        text: extractedText ? extractedText.substring(0, 100) + "..." : extractedText,
        title: pageTitle,
        isYoutube,
        isNaverNews,
    });

    return {
        urlType,
        text: extractedText,
        title: pageTitle,
        isYoutube,
        isNaverNews,
    };
}
