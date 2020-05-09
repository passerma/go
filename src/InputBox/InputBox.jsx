import React from 'react';
import './InputBox.less';
import { Input, Popover, message } from 'antd';
import { SearchOutlined, createFromIconfontCN, DeleteOutlined } from '@ant-design/icons';
import { getStorage, setStorage } from '../api/globalFunc'
import { FetchData } from '../api/api'

const MyIcon = createFromIconfontCN({
    scriptUrl: '//at.alicdn.com/t/font_1730977_cjcaiw57km6.js', // 在 iconfont.cn 上生成
});

window.sogou = {
    sug: () => { }
}

export default class InputBox extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            list: [],
            value: '',
            showList: false,
            type: 'baidu',
            historyList: [],
            opacityValue: 1
        };
        this.input = React.createRef();
        this.nowHistoryIndex = 0
    }
    componentDidMount() {
        let historyList = getStorage('historyList', [])
        this.setState({
            historyList
        })
        const that = this
        window.queryList = (data) => {
            let arr = data.s;
            let needArr = arr.splice(0, 8)
            that.setState({
                list: needArr
            })
        }
        window.sogou.sug = (data) => {
            let arr = data[1];
            let needArr = arr.splice(0, 8)
            that.setState({
                list: needArr
            })
        }
        window.biying = (data) => {
            let arr = data.AS.Results ? data.AS.Results[0].Suggests : []
            let needArr = arr.splice(0, 8)
            let dataEnd = []
            for (let i = 0; i < needArr.length; i++) {
                dataEnd.push(needArr[i].Txt)
            }
            that.setState({
                list: dataEnd
            })
        }
        document.addEventListener('click', this.clickDocu)
        document.addEventListener('keydown', this.keyDown)
    }

    //#region 输入框相关
    /** 
     * 搜索框改变
     */
    inputChange = (e) => {
        let { type } = this.state
        let value = e.target.value
        this.setState({
            value: value
        })
        this.valueHad = value
        this.nowHistoryIndex = 0
        if (value.trim() === '') {
            return
        }
        if (type === 'sougou') {
            let url = `https://www.sogou.com/suggnew/ajajjson?type=web&key=${value}`
            this.addScript(url)
        }
        if (type === 'baidu') {
            let url = `https://sp0.baidu.com/5a1Fazu8AA54nxGko9WTAnF6hhy/su?wd=${value}&cb=queryList`
            this.addScript(url)
        }
        if (type === 'biying') {
            let url = `https://api.bing.com/qsonhs.aspx?type=cb&q=${value}&cb=biying`
            this.addScript(url)
        }
        this.input.current.focus()
    }

    /** 
     * 跨域请求
     */
    addScript = (url) => {
        var s = document.createElement("script");
        s.src = url;
        s.type = "text/javascript";
        document.body.appendChild(s);
    }

    /** 
     * 点击搜索
    */
    search = () => {
        let { value, type } = this.state
        this.addStorage(value)
        if (value.trim() !== '') {
            type === 'baidu' && window.open(`https://www.baidu.com/s?wd=${value}`)
            type === 'sougou' && window.open(`https://www.sogou.com/web?query=${value}`)
            type === 'biying' && window.open(`https://cn.bing.com/search?q=${value}`)
        }
    }
    //#endregion

    //#region 监听事件相关
    /** 
     * 键盘事件
     */
    keypress = (e) => {
        if (e.which !== 13) return
        this.search()
    }

    /** 
     * 页面点击
     */
    clickDocu = (e) => {
        if (e.target.getAttribute('clickon')) {
            this.setState({
                showList: true
            })
        } else {
            this.setState({
                showList: false
            })
        }
    }

    /** 
     * 导航点击
     */
    typeClick = (type) => {
        document.removeEventListener('click', this.clickDocu)
        this.setState({
            type: type,
            showList: true,
            showType: false
        }, () => {
            this.input.current.focus()
            document.addEventListener('click', this.clickDocu)
            let { value } = this.state
            if (value.trim() === '') {
                return
            }
            if (type === 'sougou') {
                let url = `https://www.sogou.com/suggnew/ajajjson?type=web&key=${value}`
                this.addScript(url)
            }
            if (type === 'baidu') {
                let url = `https://sp0.baidu.com/5a1Fazu8AA54nxGko9WTAnF6hhy/su?wd=${value}&cb=queryList`
                this.addScript(url)
            }
            if (type === 'biying') {
                let url = `https://api.bing.com/qsonhs.aspx?type=cb&q=${value}&cb=biying`
                this.addScript(url)
            }
        })
    }

    /** 
     * 面板监听
    */
    typeChange = (change) => {
        this.setState({
            showType: change
        })
    }

    /** 
     * 方向键监听
    */
    keyDown = (e) => {
        let { list, value, showList } = this.state
        if (list.length && value.trim() !== '' && showList) {
            switch (e.keyCode) {
                case 38:
                    if (this.nowHistoryIndex > 0) {
                        this.nowHistoryIndex -= 1
                    } else {
                        this.nowHistoryIndex = list.length
                    }
                    if (this.nowHistoryIndex === 0) {
                        this.setState({
                            value: this.valueHad
                        })
                    } else {
                        this.setState({
                            value: list[this.nowHistoryIndex - 1]
                        })
                    }
                    break;
                case 40:
                    if (this.nowHistoryIndex < list.length) {
                        this.nowHistoryIndex += 1
                    } else {
                        this.nowHistoryIndex = 0
                    }
                    if (this.nowHistoryIndex === 0) {
                        this.setState({
                            value: this.valueHad
                        })
                    } else {
                        this.setState({
                            value: list[this.nowHistoryIndex - 1]
                        })
                    }
                    break;
                default:
                    break;
            }
        }

    }
    //#endregion

    //#region 历史相关
    /** 
     * 添加历史
     */
    addStorage = (value) => {
        value = value.trim()
        if (value === '' || !this.props.remeber) {
            return
        }
        let { historyList } = this.state
        let has = false
        for (var i = 0; i < historyList.length; i++) {
            if (historyList[i] === value) {
                has = true
                historyList.splice(i, 1);
                break;
            }
        }
        if (historyList.length === 8 && !has) {
            historyList.pop()
        }
        historyList.unshift(value);
        setStorage('historyList', historyList)
        if (this.props.islogin && this.props.ishistory) {
            this.history2sqlOnly(historyList)
        }
        this.setState({
            historyList
        })
    }

    /** 
     * 删除历史
     */
    delList = (e, value) => {
        e.stopPropagation()
        e.preventDefault()
        document.removeEventListener('click', this.clickDocu)
        let { historyList } = this.state
        for (var i = 0; i < historyList.length; i++) {
            if (historyList[i] === value) {
                historyList.splice(i, 1);
                break;
            }
        }
        setStorage('historyList', historyList)
        if (this.props.islogin && this.props.ishistory) {
            this.history2sqlOnly(historyList)
        }
        this.setState({
            historyList
        }, () => {
            document.addEventListener('click', this.clickDocu)
        })
    }

    /** 
     * 清空
     */
    clearHistory = () => {
        setStorage('historyList', [])
        if (this.props.islogin && this.props.ishistory) {
            this.history2sqlOnly([])
        }
        this.setState({
            historyList: []
        })
    }

    /** 
     * 登录时设置历史
     */
    setHistory = (data) => {
        if (!data) {
            this.history2sql()
            return
        }
        setStorage('historyList', data)
        this.setState({
            historyList: data
        })
    }
    //#endregion

    //#region 接口相关
    /** 
     * 发起同步记录
     */
    history2sql = () => {
        let { historyList } = this.state
        let golist = getStorage('golist', [])
        let url = '/go/fisthistory'
        let params = {
            method: "POST",
            headers: {
                'content-type': 'application/json'
            },
            body: JSON.stringify({
                history: historyList,
                golist
            })
        }
        FetchData(url, params, (res) => {
            if (!res || res.ErrCode !== 0) {
                message.error('账号同步功能初始化失败，请退出重新登录再次开启')
            }
        })
    }

    /** 
     * 同步历史记录
    */
    history2sqlOnly = (historyList) => {
        let url = '/go/history'
        let params = {
            method: "POST",
            headers: {
                'content-type': 'application/json'
            },
            body: JSON.stringify({
                history: historyList
            })
        }
        FetchData(url, params, (res) => {
            if (!res || res.ErrCode !== 0) {
                message.error('历史记录同步失败')
            }
        })
    }
    //#endregion

    //#endregion 界面设置相关
    setOpacity = (value) => {
        this.setState({
            opacityValue: value * 0.1
        })
    }
    //#region 
    render() {
        let { list, value, showList, type, showType, historyList, opacityValue } = this.state

        const menu = (
            <ul>
                <li>
                    <MyIcon className="input-btn-type" onClick={(e) => this.typeClick('baidu')} type="icon-baidu" title="百度" />
                </li>
                <li>
                    <MyIcon className="input-btn-type" onClick={(e) => this.typeClick('sougou')} type="icon-sougou" title="搜狗" />
                </li>
                <li>
                    <MyIcon className="input-btn-type" onClick={(e) => this.typeClick('biying')} type="icon-biying" title="必应" />
                </li>
            </ul>
        );



        return (
            <div className="input-box" style={{ opacity: opacityValue }}>
                <div className="input-wrap">
                    <Input placeholder="搜索网页" onChange={this.inputChange} value={value} ref={this.input} clickon="true"
                        onKeyPress={this.keypress} onKeyDown={(event) => {
                            let key_num = event.keyCode;
                            if (38 === key_num) {
                                event.preventDefault();
                            }
                        }}></Input>
                    <SearchOutlined style={{ 'borderTopRightRadius': '4px', 'borderBottomRightRadius': '4px' }}
                        className="input-btn" onClick={this.search} />
                    {/* <MyIcon className="input-btn" type="icon-baidu1" /> */}
                    <Popover overlayClassName="input-type" content={menu} arrowPointAtCenter placement="bottom"
                        trigger="click" visible={showType} onVisibleChange={this.typeChange}>
                        <MyIcon className="input-btn" type={`icon-${type}`} />
                    </Popover>
                </div>
                {
                    (list.length && value.trim() !== '' && showList) === true && <ul className="input-ul">
                        {
                            list.map((element, index) => <li key={index} onClick={() => {
                                this.addStorage(element)
                                type === 'baidu' && window.open(`https://www.baidu.com/s?wd=${element}`)
                                type === 'sougou' && window.open(`https://www.sogou.com/web?query=${element}`)
                                type === 'biying' && window.open(`https://cn.bing.com/search?q=${element}`)
                            }} className="input-li">{element}</li>)
                        }
                    </ul>
                }
                {
                    (historyList.length && value.trim() === '' && showList) === true && <ul className="input-ul">
                        {
                            historyList.map((element, index) => <li key={index} onClick={() => {
                                this.addStorage(element)
                                type === 'baidu' && window.open(`https://www.baidu.com/s?wd=${element}`)
                                type === 'sougou' && window.open(`https://www.sogou.com/web?query=${element}`)
                                type === 'biying' && window.open(`https://cn.bing.com/search?q=${element}`)
                            }} className="input-li input-li-his">
                                {element}
                                <DeleteOutlined onClick={(e) => this.delList(e, element)} title="删除" />
                            </li>)
                        }
                    </ul>
                }
            </div>
        );
    }
}
