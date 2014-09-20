/*DownStore.....supposedly a Media Store...

this project Assumes 3 web APIs...
1 API from vimeo.com for video
2 API from 4shared.com for music
3 API  from 4shared.com for apps
*/



//object representation of APIs...helps all APIs use a single Ajax Caller(ajaxCategory)

var Categories = {
	video :  {
		idName: "video",
		playerUrl: "http://player.vimeo.com/video/",
		categoryKey:null,
		url:"https://api.vimeo.com/tags/fun/videos?per_page=5",
		pageUrl:"https://api.vimeo.com/tags/fun/videos?per_page=25",
		searchUrl:"https://api.vimeo.com/videos",
		dataType: "json",
		apiKey:"",
		sort: "created_time",
		beforeSend: function(xhr){
			xhr.setRequestHeader("Authorization", "bearer 34210aeac4e02a251b8821a53620e93c");
			xhr.setRequestHeader("Accept", "application/vnd.vimeo.*+json;version=3.0")
		},
		responseDataKey:"data"
	},
	music:{
		idName: "music",
		iconUrl: "img/music_icon.jpg",
		url: "https://api.4shared.com/v0/files.jsonp?oauth_consumer_key=0d3484a1de10c0a182316553199137b2&limit=5&category=1",
		searchUrl: "https://api.4shared.com/v0/files.jsonp?oauth_consumer_key=0d3484a1de10c0a182316553199137b2&limit=5&category=1",
		pageUrl: "https://api.4shared.com/v0/files.jsonp?oauth_consumer_key=0d3484a1de10c0a182316553199137b2&limit=25&category=1",
		dataType: "jsonp",
		responseDataKey: "files"
	},

	app:{
		idName: "app",
		iconUrl: "img/app_icon.jpg",
		url: "https://api.4shared.com/v0/files.jsonp?oauth_consumer_key=0d3484a1de10c0a182316553199137b2&limit=5&category=6",
		searchUrl: "https://api.4shared.com/v0/files.jsonp?oauth_consumer_key=0d3484a1de10c0a182316553199137b2&limit=25&category=6",
		pageUrl: "https://api.4shared.com/v0/files.jsonp?oauth_consumer_key=0d3484a1de10c0a182316553199137b2&limit=25&category=6",
		dataType: "jsonp",
		responseDataKey: "files"
	},

}



//manager of entire media store app
var storeManager = {
	onReady: function(){
		$("#menu").prop("menu_out", false);
		storeManager.fetchAllRecentCategory();
		$(".link").click(storeManager.singleCategoryView)
		$("#search_button").click(storeManager.searchCategory);
		$("#menu").click(storeManager.toggleMenu);
	},
	homePageKey:"home",

	homeUrlKey: "url",

	searchUrlKey: "searchUrl",

	pageUrlKey: "pageUrl",
	
	page:null,

	searchQuery:null,

	loadingIcon: "<img src='img/loading_icon.gif'>",

	toggleMenu: function(event){
		if(!$("#menu").prop("menu_out"))
		{
			$(".link").animate({"font-size":"1em", width: "35px", "padding-top":"10px",
				"padding-bottom": "10px"}, 300, function(){$("#menu").prop("menu_out", true);});
		}
		else{
			$(".link").animate({"font-size":"0em", width: "0px", "padding-top":"0px",
				"padding-bottom": "0px"}, 300, function(){$("#menu").prop("menu_out", false);});	
		}
			
	},

	//displays a single category on the entire page
	singleCategoryView: function(event){
		storeManager.toggleMenu();
		$("#msg").html("");
		var category = Categories[$(this).attr("category")];
		storeManager.page = category.idName;
		
		$("#"+ category.idName).parent().show();

		$.each(Categories, function(index, datum){
			if(datum.idName !== category.idName){
				$("#"+ datum.idName).parent().hide();
			}
		}
			)
		storeManager.ajaxCategory(category, storeManager.pageUrlKey);
	},


	//user query search
	searchCategory: function(event){
		$("#msg").html("");
		storeManager.searchQuery = $("#search").val();
		$("#search").val("");

		//tests input validity
		if(!storeManager.searchQuery.trim())
		{
			$("#msg").html("<p>please enter a valid input</p>");
			return;
		}
		
		if(storeManager.page === storeManager.homePageKey){
			$.each(Categories, function(key, datum){
					storeManager.ajaxCategory(datum, storeManager.searchUrlKey);
				}
			);
		}
		else{
			storeManager.ajaxCategory(Categories[storeManager.page], storeManager.searchUrlKey);
		}
	},

	
	//fetches recent entries of all categories
	fetchAllRecentCategory: function(){
		$("#msg").html("");
		storeManager.page = storeManager.homePageKey;
		$.each(Categories, function(key, datum){
				storeManager.ajaxCategory(datum, storeManager.homeUrlKey);
			}
		);
	},

	
	//AJAX CALLER....fetches entry of a category
	ajaxCategory: function(category, urlType){
		var url = category[urlType];
		var data = null;
		var $outputSection = $("#" + category.idName);
		
		//shows loading icon while ajax loads
		$outputSection.html(storeManager.loadingIcon);
		if(urlType === "searchUrl")
		{
			data = {query: storeManager.searchQuery};
		}
		$.ajax
		(
			{
				url: url,
				dataType: category.dataType,
				beforeSend: category.beforeSend,
				data: data,
				success: function(response){
					console.log(response);
					var counter = 0;
					$outputSection.html("");
					var looper = response[category.responseDataKey];
					if(looper.length ===0){
						$outputSection.html("<p>No Result Found</p>");
					}

					$.each(looper, function(index, datum){
						var $liElement = $("<li></li>");
						var $imgElement = $("<img>");
						var $pElement = $("<p></p>");
						$pElement.html(datum.name.substr(0, 25) + "...");
						if(category.idName ==="video")
						{
							var $iframe = $("<iframe width='180' height='180' frameborder='0' webkitallowfullscreen mozallowfullscreen allowfullscreen></iframe>");
							$iframe.attr("src", category.playerUrl + datum.uri.substr(8));
							$liElement.html($iframe);
							$liElement.append($pElement);
							$outputSection.append($liElement);
						}
						else
						{
							$imgElement.attr("src", category.iconUrl);	
							var $aElement = $("<a target='_blank'></a>");
							$aElement.attr("href", datum.downloadPage);
							$liElement.html($imgElement);
							$liElement.append($pElement);
							$aElement.html($liElement);
							$outputSection.append($aElement);
						}

						if(counter === 5 && storeManager.page === storeManager.homePageKey)
						{
							return false
						}
						counter++;
					}	
					);	
				}
			}
		);	
	},
}


$(document).ready(storeManager.onReady);
