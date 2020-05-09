import React, { Fragment } from 'react';
import './InputGo.less';
import { Menu, Dropdown, Modal, Input, message } from 'antd'
import { EditOutlined, PlusOutlined, FormOutlined, DeleteOutlined } from '@ant-design/icons';
import { getStorage, setStorage } from '../api/globalFunc'
import { FetchData } from '../api/api'

export default class InputBg extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            changeI: '',
            nameVisible: false,
            changeName: '',
            addVisible: false,
            displayNone: true,
            goList: [],
            opacityValue: 10
        };
    }

    componentDidMount() {
        let goList = getStorage('golist', [])
        this.setState({
            goList
        })
        window.addEventListener('resize', this.resizeBind)

        if (document.querySelector('.input-box') && this.refs.inputGoDom && document.querySelector('.input-bg-btn')) {
            let inputBox = document.querySelector('.input-box').getBoundingClientRect().top + 44
            let inputGoBox = this.refs.inputGoDom.getBoundingClientRect().top
            let inputGoBoxBot = this.refs.inputGoDom.getBoundingClientRect().bottom
            let inputBgBtn = document.querySelector('.input-bg-btn').getBoundingClientRect().top
            if (inputGoBox <= inputBox + 10) {
                this.setState({
                    displayNone: false
                })
            } else {
                this.setState({
                    displayNone: true
                })
            }
            if (inputGoBoxBot > inputBgBtn) {
                document.querySelector('.input-bg-btn').style.zIndex = -1
            } else {
                document.querySelector('.input-bg-btn').style.zIndex = 2
            }
        }
    }

    componentWillUnmount() {
        window.removeEventListener('resize', this.resizeBind)
    }

    resizeBind = (e) => {
        let inputBox = document.querySelector('.input-box').getBoundingClientRect().top + 44
        let inputGoBox = this.refs.inputGoDom.getBoundingClientRect().top
        let inputGoBoxBot = this.refs.inputGoDom.getBoundingClientRect().bottom
        let inputBgBtn = document.querySelector('.input-bg-btn').getBoundingClientRect().top
        if (inputGoBox <= inputBox + 10) {
            this.setState({
                displayNone: false
            })
        } else {
            this.setState({
                displayNone: true
            })
        }
        if (inputGoBoxBot > inputBgBtn) {
            document.querySelector('.input-bg-btn').style.zIndex = -1
        } else {
            document.querySelector('.input-bg-btn').style.zIndex = 2
        }
    }

    /** 
     * 添加网站
    */
    showConfirmAdd = () => {
        this.setState({
            addVisible: true,
        }, () => {
            this.refs.addInput.focus()
        });
    }

    /** 
     * 输入框改变
    */
    onChangeName = (e) => {
        let value = e.target.value
        this.setState({
            changeName: value
        })
    }
    i
    /** i
     * 删除
    */
    delGo = (i) => {
        let { goList } = this.state
        goList.splice(i, 1)
        setStorage('golist', goList)
        if (this.props.islogin && this.props.islike) {
            this.likeUrl2sql(goList)
        }
        this.setState({
            goList
        })
    }

    /** 
     * 修改名字
    */
    showConfirmName = (i) => {
        let { goList } = this.state
        this.setState({
            nameVisible: true,
            changeI: i,
            changeName: goList[i].name,
            titleChange: goList[i].name,
        }, () => {
            this.refs.changeInput.focus()
            this.refs.changeInput.select()
        });
    }

    /**
     * 提交编辑
     */
    handleOkName = (type) => {
        let { goList, changeName, changeI } = this.state
        if (type === 'name') {
            goList[changeI].name = changeName
            setStorage('golist', goList)
            if (this.props.islogin && this.props.islike) {
                this.likeUrl2sql(goList)
            }
            this.setState({
                nameVisible: false
            })
        }
        if (type === 'add') {
            if (this.refs.addInputUrl.input.value.trim() === '') {
                return
            }
            let newAdd = {
                name: '',
                url: '',
                hasImg: true
            }
            newAdd.name = this.refs.addInput.input.value.trim()
            newAdd.url = this.refs.addInputUrl.input.value.trim()
            this.refs.addInput.input.value = ''
            this.refs.addInputUrl.input.value = ''
            goList.push(newAdd)
            setStorage('golist', goList)
            if (this.props.islogin && this.props.islike) {
                this.likeUrl2sql(goList)
            }
            this.setState({
                addVisible: false,
                goList
            })
        }
    }

    /** 
     * 登录时获得收藏
    */
    setGoList = (goList) => {
        if (!goList) {
            return
        }
        setStorage('golist', goList)
        this.setState({
            goList
        })
    }

    /**
     * 提交编辑
     */
    handleCancelName = (type) => {
        if (type === 'name') {
            this.setState({
                nameVisible: false
            })
        }
        if (type === 'add') {
            this.refs.addInput.input.value = ''
            this.refs.addInputUrl.input.value = ''
            this.setState({
                addVisible: false
            })
        }
    }

    /** 
     * 图标发生错误
    */
    imgError = (i) => {
        let { goList } = this.state
        goList[i].hasImg = false
        setStorage('golist', goList)
        if (this.props.islogin && this.props.islike) {
            this.likeUrl2sql(goList)
        }
        this.setState({
            goList: goList
        })
    }

    /** 
     * 生成编辑菜单
     */
    createEdit = (i) => {
        const menu = (
            <Menu className="input-go-menu">
                <Menu.Item onClick={() => this.showConfirmName(i)}>
                    <FormOutlined style={{ fontSize: '14px' }} />
                    <span>重命名</span>
                </Menu.Item>
                <Menu.Item onClick={() => this.delGo(i)}>
                    <DeleteOutlined style={{ fontSize: '14px' }} />
                    <span>删除</span>
                </Menu.Item>
            </Menu>
        );
        return menu
    }


    /** 
     * 生成底部菜单
    */
    createListDom = () => {
        let { goList } = this.state
        let listDom = []
        let end = false
        for (let i = 0; i < 8; i++) {
            if (goList[i]) {
                let url = goList[i].url
                if (url) {
                    var http = /^http:\/\/.*/i.test(url);
                    var https = /^https:\/\/.*/i.test(url);
                    if (!http && !https) {
                        url = 'https://' + url;
                    }
                }
                listDom.push(
                    <div key={i} className="go-item">
                        <div className="go-edit">
                            <Dropdown overlay={this.createEdit(i)} placement="bottomLeft" trigger="click"
                                overlayClassName="input-go-drop">
                                <EditOutlined className="go-edit-icon" />
                            </Dropdown>
                        </div>
                        <a href={url} rel="nofollow me noopener noreferrer" target="_blank">
                            <div className="go-box">
                                {
                                    goList[i].hasImg ?
                                        <img alt="a" src={`${url}/favicon.ico`} onError={() => this.imgError(i)} /> :
                                        <span>{goList[i].name[0]}</span>
                                }
                                <div title={goList[i].name}>{goList[i].name}</div>
                            </div>
                        </a>
                    </div>
                )
            } else {
                if (!end) {
                    listDom.push(
                        <div onClick={this.showConfirmAdd} key={i} className="go-item go-item-add">
                            <PlusOutlined className="go-btn-add" />
                        </div>
                    )
                } else {
                    listDom.push(
                        <div key={i} className="go-item go-item-none">
                        </div>
                    )
                }
                end = true
            }
        }
        return listDom
    }

    /**
     * 设置透明度
     */
    setOpacity = (value) => {
        this.setState({
            opacityValue: value * 0.1
        })
    }

    //#region 接口相关
    /** 
     * 同步收藏
     */
    likeUrl2sql = (golist) => {
        let url = '/go/likeurl'
        let params = {
            method: "POST",
            headers: {
                'content-type': 'application/json'
            },
            body: JSON.stringify({
                golist
            })
        }
        FetchData(url, params, (res) => {
            if (!res || res.ErrCode !== 0) {
                message.error('网站收藏同步失败')
            }
        })
    }
    //#endregion

    render() {

        let { nameVisible, changeName, addVisible, displayNone, titleChange, opacityValue } = this.state

        let className = displayNone ? 'input-go' : 'input-go input-go-none'

        return (
            <Fragment>
                {
                    <div style={{ opacity: opacityValue }} ref="inputGoDom" className={className}>{this.createListDom()}</div>
                }
                <Modal
                    title={`重命名${titleChange}网站`}
                    wrapClassName="input-go-nameConf"
                    visible={nameVisible}
                    centered
                    forceRender
                    onOk={() => this.handleOkName('name')}
                    okText="保存"
                    cancelText="取消"
                    onCancel={() => this.handleCancelName('name')}
                >
                    <div className="input-go-nameText">
                        <span>名称</span>
                        <Input ref="changeInput" onChange={this.onChangeName} value={changeName}></Input>
                    </div>
                </Modal>
                <Modal
                    wrapClassName='input-go-addConf'
                    title='添加网站'
                    centered
                    visible={addVisible}
                    destroyOnClose
                    forceRender
                    onOk={() => this.handleOkName('add')}
                    okText="添加"
                    cancelText="取消"
                    onCancel={() => this.handleCancelName('add')}
                >
                    <div className="input-go-addText">
                        <span>名称</span>
                        <Input ref="addInput"></Input>
                    </div>
                    <div className="input-go-addText">
                        <span>URL</span>
                        <Input ref="addInputUrl"></Input>
                    </div>
                </Modal>
            </Fragment >
        );
    }
}
