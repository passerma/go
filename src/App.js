import React from 'react';
import './App.css';
import InputBox from './InputBox/InputBox'
import InputBg from './InputBg/InputBg'
import InputGo from './InputGo/InputGo'
import InputSet from './InputSet/InputSet'
import { getStorage, setStorage } from './api/globalFunc'
import { FetchData } from './api/api'

class App extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			remeber: true,
			islogin: false,
			ishistory: 0,
			islike: 0,
			isbgurl: 0,
			userInfo: {},
			opacityValue: 10
		};
	}

	componentDidMount() {
		let remeber = getStorage('remeber', true)
		let opacity = getStorage('opacity', 10)
		let params = {
			method: "GET",
		}
		let url = '/go/islogin'
		FetchData(url, params, (res) => {
			if (res && res.ErrCode === 0) {
				// 如果有备份
				if (res.data.ishistory === 0 || res.data.ishistory === 1) {
					// 开启了历史同步
					if (res.data.ishistory) {
						this.refs.InputBox.setHistory(res.data.historyData)
					}
					// 开启了收藏同步
					if (res.data.islike) {
						this.refs.InputGo.setGoList(res.data.likeUrlData)
					}
					this.setState({
						islogin: true,
						userInfo: res.data,
						ishistory: res.data.ishistory ? 1 : 0,
						islike: res.data.islike ? 1 : 0,
						isbgurl: res.data.isbgurl ? 1 : 0,
					}, () => {
						this.refs.InputBg.setBgUrlFist(res.data.isbgurl)
					})
				} else {
					// 无备份，开启初始化
					this.refs.InputBox.setHistory(res.data.historyData)
					this.refs.InputGo.setGoList(res.data.likeUrlData)
					this.setState({
						islogin: true,
						userInfo: res.data,
						ishistory: 1,
						islike: 1,
						isbgurl: 0
					}, () => {
						this.refs.InputBg.setBgUrlFist(0)
					})
				}
			} else {
				this.refs.InputBg.setBgUrlFist(0)
			}
		})
		this.setOpacity(opacity)
		this.setState({
			remeber
		})
	}

	//#region 登陆注册相关
	/** 
	 * 登录退出登录
	*/
	setLogin = (type, data) => {
		if (type) {
			// 如果有备份
			if (data.ishistory === 0 || data.ishistory === 1) {
				// 开启了历史同步
				if (data.ishistory) {
					this.refs.InputBox.setHistory(data.historyData)
				}
				// 开启了收藏同步
				if (data.islike) {
					this.refs.InputGo.setGoList(data.likeUrlData)
				}
				this.setState({
					ishistory: data.ishistory ? 1 : 0,
					islike: data.islike ? 1 : 0,
					isbgurl: data.isbgurl ? 1 : 0,
				}, () => {
					this.refs.InputBg.setBgUrlFist(data.isbgurl)
				})
			} else {
				// 无备份，开启初始化
				this.refs.InputBox.setHistory(data.historyData)
				this.refs.InputGo.setGoList(data.likeUrlData)
				this.setState({
					ishistory: 1,
					islike: 1,
					isbgurl: 0
				}, () => {
					this.refs.InputBg.setBgUrlFist(0)
				})
			}
		} else {
			this.setState({
				isbgurl: 0
			}, () => {
				this.refs.InputBg.setBgUrlFist(0)
			})
		}
		this.setState({
			islogin: type,
			userInfo: data,
		})
	}
	//#endregion

	//#region 设置发生改变
	setChange = (ishistory, islike) => {
		this.setState({
			islike,
			ishistory
		})
		if (ishistory) {
			let historyList = getStorage('historyList', [])
			this.refs.InputBox.history2sqlOnly(historyList)
		}
		if (islike) {
			let goList = getStorage('golist', [])
			this.refs.InputGo.likeUrl2sql(goList)
		}
	}
	//#endregion

	//#region 背景图模块
	setBgUrlFile = (file) => {
		this.setState({
			isbgurl: 1
		})
		this.refs.InputBg.setBgUrlFile(file)
	}

	/** 
	 * 还原背景
	*/
	recoverBgUrl = () => {
		this.setState({
			isbgurl: 0
		})
		this.refs.InputBg.recoverBgUrl()
	}
	//#endregion

	//#endregion 界面控制模块
	clearHistory = () => {
		this.refs.InputBox.clearHistory()
	}

	setRemeber = (checked) => {
		setStorage('remeber', checked)
		this.setState({
			remeber: checked
		})
	}

	setOpacity = (value) => {
		setStorage('opacity', value)
		this.refs.InputBox.setOpacity(value)
		this.refs.InputGo.setOpacity(value)
		this.refs.InputBg.setOpacity(value)
		this.setState({
			opacityValue: value * 0.1
		})
	}
	//#region 

	render() {
		let { remeber, islogin, userInfo, ishistory, islike, isbgurl, opacityValue } = this.state
		return (
			<div className="App">
				<h1>PM导航，极简导航</h1>
				<InputBg ref="InputBg" isbgurl={isbgurl}>></InputBg>
				<InputBox ref="InputBox" islogin={islogin} remeber={remeber} ishistory={ishistory}></InputBox>
				<InputGo islike={islike} islogin={islogin} ref="InputGo"></InputGo>
				<InputSet setLogin={this.setLogin} islogin={islogin} userInfo={userInfo} remeber={remeber}
					clearHistory={this.clearHistory} setRemeber={this.setRemeber} setChange={this.setChange}
					setBgUrlFile={this.setBgUrlFile} recoverBgUrl={this.recoverBgUrl} setOpacity={this.setOpacity}
					islike={islike} ishistory={ishistory} isbgurl={isbgurl} opacityValue={opacityValue}></InputSet>
				<div className="input-copy" style={{ opacity: opacityValue }}>
					<a href="https://www.passerma.com" rel="nofollow me noopener noreferrer" target="_blank">&copy;&nbsp;PASSERMA</a>
					<a href="http://www.beian.miit.gov.cn" rel="nofollow me noopener noreferrer" target="_blank">浙ICP备18045684号-2</a>
					<a href="http://www.beian.gov.cn/portal/registerSystemInfo?recordcode=33011802001747"
						rel="nofollow me noopener noreferrer" target="_blank">浙公网安备 33011802001747号</a>
				</div>
			</div>
		)
	}
}

export default App;
