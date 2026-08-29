---
title: HTML 템플릿 글 쓰는 법 (이 파일은 밑줄로 시작해 빌드에서 제외된다)
description: 버튼·입력처럼 조작 가능한 콘텐츠를 넣고 싶을 때 이 템플릿을 쓴다.
date: 2026-01-01
tags: [demo]
# 이 한 줄이 핵심이다. 머리말 아래 본문 전체가 마크다운 변환 없이
# HTML 그대로 페이지에 실린다. <script> 와 <style> 도 그대로 동작한다.
template: html
---

<!--
  HTML 템플릿 글 쓰는 법

  1. 이 파일을 복사 → src/content/blog/영문-슬러그.md 로 저장 (스터디 폴더도 가능)
  2. 머리말(title 등)은 다른 글과 똑같이 쓴다. template: html 만 잊지 않는다
  3. 본문은 마크다운이 아니라 HTML 로 쓴다. 아래는 동작하는 예시다.

  알아둘 것
  - 제목·날짜·태그·푸터 틀은 노트 템플릿과 같다. 본문 자리만 HTML 이 된다
  - 일반 <p>, <h2>, <ul> 은 글 페이지와 같은 활자로 나온다 (prose 상속)
  - 위젯 스타일은 <style> 로 직접 쓴다. 클래스 이름은 다른 글과 겹치지 않게
    demo- 처럼 접두어를 붙이는 편이 안전하다
  - 검색·RSS·llms.txt 에는 태그를 걷어낸 텍스트만 실린다
-->

<p>이 글은 HTML 로 작성되었습니다. 아래 버튼은 실제로 동작합니다.</p>

<div class="demo-counter">
  <button type="button" id="demo-btn">눌러 보세요</button>
  <span id="demo-count" class="mono">0</span>
</div>

<h2>일반 문단도 그대로 쓴다</h2>
<p>HTML 이라고 해서 전부 위젯일 필요는 없다. 문단·소제목·목록은 이렇게 쓴다.</p>

<style>
  .demo-counter{display:flex;gap:12px;align-items:center;margin:20px 0}
  .demo-counter button{
    font:500 13px/1 var(--mono);padding:10px 16px;cursor:pointer;
    border:1px solid var(--ink);background:var(--paper);color:var(--ink);
  }
  .demo-counter button:hover{background:var(--ink);color:var(--paper)}
</style>

<script>
  document.getElementById('demo-btn').addEventListener('click', () => {
    const el = document.getElementById('demo-count');
    el.textContent = String(Number(el.textContent) + 1);
  });
</script>
