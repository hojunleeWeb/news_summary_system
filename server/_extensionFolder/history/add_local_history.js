// src/utils/historyManager.js (또는 관련 유틸리티 파일)

/**
 * 페이지 요약 및 이미지 캡셔닝 이력을 Chrome Local Storage에 저장합니다.
 * @param {string} url - 요약된 페이지의 URL.
 * @param {string} title - 요약된 페이지의 제목.
 * @param {string} summary - 페이지의 텍스트 요약 본문.
 * @param {string} text - 원본 페이지의 전체 텍스트 (선택 사항).
 * @param {Array<Array<string>>} [img_captions=[]] - [[이미지_src, 이미지_캡셔닝_텍스트], ...] 형태의 배열 (선택 사항).
 */
export function add_local_history(url, title, summary, text, img_captions = []) {
    const today = new Date().toISOString(); // 현재 날짜와 시간 (ISO 8601 형식)

    chrome.storage.local.get(["summaryHistory"], (result) => {
        const historyArray = result.summaryHistory || []; // 기존 이력 배열 또는 새 배열

        const newEntry = {
            id: Date.now() + Math.random().toString(36).substring(2, 9), // 고유 ID 추가 (삭제 시 용이)
            date: today,
            url,
            title,
            summary,
            text, // 원본 텍스트도 저장 (필요시 상세 보기용)
            img_captions, // 이미지 캡션 데이터 추가
        };

        historyArray.unshift(newEntry); // 가장 최신 항목을 배열 맨 앞에 추가

        // (선택 사항) 이력 개수 제한
        // 예를 들어, 최신 100개 항목만 유지하려면:
        // if (historyArray.length > 100) {
        //     historyArray = historyArray.slice(0, 100);
        // }

        // Chrome Storage에 저장
        chrome.storage.local.set({ summaryHistory: historyArray }, () => {
            console.log("요약 및 이미지 이력 저장 완료:", newEntry.title || newEntry.url);
        });
    });
}
