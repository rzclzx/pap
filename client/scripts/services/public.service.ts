/// <reference path="../../typings/index.d.ts" />

import { Injectable } from "@angular/core";



@Injectable()
export class PublicService {

    public getThreeBar(data,xnames,isRate){
        let myseries = [],
            names = [],
            mytooltip,
            myformatter = "",
			scrollLength;
		scrollLength = Math.round(1500/xnames.length);
        for(let i = 0;i < data.length;i++){
            names.push(data[i].name);
            myseries.push({
                name: data[i].name,
                type: 'bar',
                data: data[i].value
            });
            myformatter += data[i].name + "：{c" + i + "}%</br>";
        }
        if(isRate){
            mytooltip = {
                trigger: 'axis',
                formatter: myformatter
            }
        }else{
            mytooltip = {
                trigger: 'axis'
            }
        }
        let option = {
            tooltip : mytooltip,
            legend: {
                data: names,
                align: "right",
                right: 160,
				selectedMode: false
            },
            calculable : true,
            xAxis : [
                {
                    type : 'category',
                    data : xnames
                }
            ],
            yAxis : [
                {
                    type : 'value',
                    axisLabel:{
                        formatter: isRate ? '{value}%' : '{value}'
                    }
                }
            ],
            dataZoom: {
				start : 0,
				end : scrollLength
			},
            series : myseries,
            color: [
                "#ABD6F8",
                "#F8DEB9",
                "#F2B7AF",
                "#CAAFF6"
            ]
        }
        return option;
    }

    // 转化时间
    public toFormalTime(time){
		let formalTimeObj = new Date(time);
		let formalMonth;
		let formalDate;
		if((formalTimeObj.getMonth()+1).toString().length === 1){
			formalMonth = '0'+(formalTimeObj.getMonth()+1);
		}else{
			formalMonth = formalTimeObj.getMonth()+1;
		}
		if(formalTimeObj.getDate().toString().length === 1){
			formalDate = '0'+formalTimeObj.getDate();
		}else{
			formalDate = formalTimeObj.getDate();
		}
		let formalTime = formalMonth+'/'+formalDate+'/'+formalTimeObj.getFullYear();
		return formalTime;
	} 
    public FormalTimeLine(time){
		let formalTimeObj = new Date(time);
		let formalMonth;
		let formalDate;
		if((formalTimeObj.getMonth()+1).toString().length === 1){
			formalMonth = '0'+(formalTimeObj.getMonth()+1);
		}else{
			formalMonth = formalTimeObj.getMonth()+1;
		}
		if(formalTimeObj.getDate().toString().length === 1){
			formalDate = '0'+formalTimeObj.getDate();
		}else{
			formalDate = formalTimeObj.getDate();
		}
        let formalTime = formalTimeObj.getFullYear() + '-' + formalMonth + '-' + formalDate;
		return formalTime;
	}
    public FormalTimeMonthandday(time){
        let formalTimeObj = new Date(time);
		let formalMonth;
		let formalDate;
		if((formalTimeObj.getMonth()+1).toString().length === 1){
			formalMonth = '0'+(formalTimeObj.getMonth()+1);
		}else{
			formalMonth = formalTimeObj.getMonth()+1;
		}
		if(formalTimeObj.getDate().toString().length === 1){
			formalDate = '0'+formalTimeObj.getDate();
		}else{
			formalDate = formalTimeObj.getDate();
		}
        let formalTime = formalMonth + '月' + formalDate + '日';
		return formalTime;
    }
    public FormalTimeHoursandminute(time){
        let formalTimeObj = new Date(time);
		let formalhour;
		let formalminute;
		if(formalTimeObj.getHours().toString().length === 1){
			formalhour = '0'+formalTimeObj.getHours();
		}else{
			formalhour = formalTimeObj.getHours();
		}
		if(formalTimeObj.getMinutes().toString().length === 1){
			formalminute = '0'+formalTimeObj.getMinutes();
		}else{
			formalminute = formalTimeObj.getMinutes();
		}
        let formalTime = formalhour + ":" + formalminute;
		return formalTime;
    }
	public getTodayStartandEnd(){
		let startDate = new Date();
		let endDate = new Date();
		startDate.setHours(0);
		startDate.setMinutes(0);
		startDate.setSeconds(0);
		endDate.setHours(23);
		endDate.setMinutes(59);
		endDate.setSeconds(59);
		let start = startDate.getTime() - startDate.getTime()%1000;
		let end = endDate.getTime() - endDate.getTime()%1000;
		let obj = {
			startDate: start,
			endDate: end
		}
		return obj;
	}
	public getNow(){
		let date = new Date();
		date.setMinutes(0);
		date.setSeconds(0);
		let dateTime = date.getTime() - date.getTime()%1000;
		return dateTime;
	}
    // 克隆对象
	public clone(obj){
		return JSON.parse(JSON.stringify(obj));
	} 
    // 下载文件
    public exportFile(url){
		var xhr = new XMLHttpRequest();
		xhr.withCredentials = true;
		xhr.open('GET', url, true);
		let tokenType = window.localStorage.getItem("tokenType");
		let token = window.localStorage.getItem("token");
		let tokens = tokenType + " " + token;
		xhr.setRequestHeader("Authorization", tokens);
		xhr.responseType = 'arraybuffer';
		xhr.onload = function () 
		{
			if (xhr.status === 200) 
			{
				var filename = "";
				var disposition = xhr.getResponseHeader('Content-Disposition');
				if (disposition && disposition.indexOf('attachment') !== -1) 
				{
					var filenameRegex = /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/;
					var matches = filenameRegex.exec(disposition);
					if (matches != null && matches[1]) filename = matches[1].replace(/['"]/g, '');
				}
				var type = xhr.getResponseHeader('Content-Type');

				var blob = new Blob([xhr.response], { type: type });
				if (typeof window.navigator.msSaveBlob !== 'undefined') 
				{
					// IE workaround for "HTML7007: One or more blob URLs were revoked by closing the blob for which they were created. These URLs will no longer resolve as the data backing the URL has been freed."
					window.navigator.msSaveBlob(blob, filename);
				}
				else
				{
					var URL = window.URL;
					var downloadUrl = URL.createObjectURL(blob);

					if (filename)
					{
						// use HTML5 a[download] attribute to specify filename
						var a = document.createElement("a");
						a.href = downloadUrl;
						a.download = filename;
						document.body.appendChild(a);
						a.click();
					    document.body.removeChild(a);	
					}

					setTimeout(function () { 
						URL.revokeObjectURL(downloadUrl);

					}, 100); // cleanup
				}
			}
		};
		xhr.setRequestHeader('Content-type', 'application/vnd.ms-excel;charset=utf-8');
		xhr.send();
	}
	// 数组根据一个参数排序
	public sortByone(arr,name){
		let sortArr = this.clone(arr);
		sortArr.sort(function(a,b){
			return a[name] - b[name];
		});
        return sortArr;
	}
}