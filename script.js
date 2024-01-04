$(document).ready(()=>{
    const key = "66d3737f6f13454880d0fe3f9948fa06";
    const inputEl = $(":input");
    const searchBtn = $(":button");
    const cardContainer = $(".grid-cards");
    const gamesContainer = $(".games");
    const pageNavEl = $(".page-nav");
    const searchMsgEl = $("main .hidden");
    const mainEl = $("main");
    const popupContainer = $(".popup-container");
    const recentSearchEl = $(".recent-search");
    const moreBtn = $('.more');
    const closeEl= $(".close-icon");
    const gameDetailContainer = $(".game-detail");
    let nextUrl;
    let previousUrl;
    let currentUrl;
    let recentSearches= [];


    function hideCurrentPage(){
        gamesContainer.addClass("hidden");
        gameDetailContainer.removeClass("hidden");
    }

    function displayTheGameDetails(data){
        hideCurrentPage();
    }
 
    function showPagination(data){
        pageNavEl.html("");
        if(data.previous){
            pageNavEl.append(`<button>Previous</button>`);
            previousUrl = data.previous;
            // console.log(data.previous);
            // console.log(previousUrl);
        }
        if(data.next){
            pageNavEl.append(`<button>Next</button>`);
            nextUrl= data.next;
            // console.log(data.next);
            // console.log(nextUrl);
        }
    }
    function displayGames(data){
        cardContainer.html("");
        for(result of data.results){
            cardContainer.append(`
                <div class="card"> 
                    <div class="attributes">
                        <ul>    
                            <li>Name:<span class="data"> ${result.name}</span></li>
                            <li> Release Date:<span class="data"> ${result.released}</span></li>
                            <li>Platform: <span class="data">${result.platforms[0].platform.name}</span></li>
                            
                        </ul>
                        <button class="more" data-id="${result.id}">Find More...</button>
                    </div>
                    <div class="screenshot">
                        <img src="${result.background_image}" alt ="">
                    </div>
                </div>
            `);
            showPagination(data);
        }
    }
    function readSavedUrlFromLS(){
        const savedUrl =localStorage.getItem("currentUrl");
        if(savedUrl){
            currentUrl= savedUrl;
        }
    }
    function saveCurrentUrlToLS(currentUrl){
        localStorage.setItem("currentUrl", JSON.stringify(currentUrl));
    }
    function fetchData(requestUrl,  dataOf ="games"){
        fetch(requestUrl)
        .then(function (response) {
            return response.json();
        })
        .then(function (data) {
            console.log("-----------------fetching games data");
            console.log(data);
            if(dataOf === "games"){
                saveCurrentUrlToLS(requestUrl)
                displayGames(data);
                gamesContainer.css("minHeight", "100%");
                inputEl.val("");
            }else{
                hideCurrentPage();
                displayTheGameDetails(data);
            }
           
        })
        .catch(function (err) {
            console.log("Something went wrong!", err);
        });
    }
    function fetchGames(gameQueryString){
        const url = "https://api.rawg.io/api/games?";
        
        // console.log(gameQueryString);
        const requestUrl = `${url}key=${key}&search="${gameQueryString}"&page_size=6`;
        fetchData(requestUrl);
        searchMsgEl.removeClass("hidden");
        searchMsgEl.html(`Showing results for: <span class="data">${gameQueryString}</span>`);

    }
    function displayRecentSearches(){
        let i= 1;
        readTheSearchesFromLS();
        // console.log("before creating list");
        recentSearchEl.html("");
        if(recentSearches.length > 0){
            recentSearches.forEach(search=>{
                recentSearchEl.append(`<li>${i}.${search}</li>`)
                // console.log("during creating list");
                i++;
            });
        }
   
        // console.log("after creating list");
    }
    function readTheSearchesFromLS(){
        const storedSearches = JSON.parse(localStorage.getItem("Search Queries"));
        if(storedSearches){
            recentSearches = storedSearches;
        }
    }
    function saveTheSearchToLS(queryString){
        let searches;
        if(recentSearches.length === 0){
            //  console.log("!recentSearches");
            recentSearches.push(queryString)
        }else{
            // console.log("recentSearches");
            searches = recentSearches.filter(search=>{
                return search != queryString;
            });
            recentSearches=searches;
            if(recentSearches.length>13){
                recentSearches.pop();
            }
            recentSearches.reverse();
            recentSearches.push(queryString);
        }
        recentSearches.reverse();
        // console.log("length " + recentSearches.length);
        localStorage.setItem("Search Queries", JSON.stringify(recentSearches));
    }
    searchBtn.on("click", ()=>{
        // console.log("button clicked");
        const searchQuery = inputEl.val();
        saveTheSearchToLS(searchQuery);
        displayRecentSearches();
        fetchGames(searchQuery);
        
    });
    inputEl.on("keyup", e =>{
        // console.log(inputEl.val());
        // console.log(e.key);
        if(e.key === "Enter"){
            const searchQuery = inputEl.val();
            saveTheSearchToLS(searchQuery);
            displayRecentSearches();
            fetchGames(searchQuery);
        }
        
    });

    pageNavEl.on("click", "button", e =>{
        // console.log($(e.target).text());
        if($(e.target).text()==="Next"){
            // console.log(nextUrl);
            fetchData(nextUrl);
        }
        if($(e.target).text()==="Previous"){
            // console.log(previousUrl);
            fetchData(previousUrl);
        }
    });
    cardContainer.on("click","img", e=>{
        const src= e.target.src;
        // console.log(src);
        const img = popupContainer.children("img");
        img.attr("src", src);
        
        mainEl.addClass("hidden");
        popupContainer.removeClass("hidden");
        // console.log(closeEl);
    });
    
    closeEl.on("click","i", () =>{
        // alert("hi");
        mainEl.removeClass("hidden");
        popupContainer.addClass("hidden");
    });

    recentSearchEl.on("click", "li", (e)=>{
        console.log($(e.target).text());
        const searchQuery = $(e.target).text();
        const searchQueryArr= Array.from(searchQuery).filter((char, i)=>{
            return i > 1;
        });
        // console.log(searchQueryArr);
        // console.log(searchQueryArr.join(""));
        
        fetchGames(searchQueryArr.join(""));
    });

    // moreBtn.on("click", (e)=>{
    cardContainer.on("click","button", e=>{
         
        const id = $(e.target).data("id");
        console.log(id);
        const url = "https://api.rawg.io/api/games/";
        const requestUrl = `${url}${id}?key=${key}`;
        // const requestUrl = `${url}key=${key}&id=${id}`;

        fetchData(requestUrl, "gameDetail");
    });



    displayRecentSearches();
});