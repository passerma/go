import React, { Fragment } from 'react';
import './InputBg.less';
import { RightCircleOutlined, LeftCircleOutlined } from '@ant-design/icons';
import { COMMON_URL } from '../api/api'
import { getBase64 } from '../api/globalFunc'

export default class InputBg extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            nowNum: 0,
            loading: true,
            url: '',
            opacityValue: 10
        };
    }

    setImg = (type) => {
        let { nowNum, loading } = this.state
        if (loading) {
            return
        }
        if (type === 'left') {
            if (nowNum === 7) {
                return
            }
            nowNum += 1
            this.setState({
                nowNum: nowNum,
                loading: true,
                url: `${COMMON_URL}/go/bingimg?d=${nowNum}`
            })
        }
        if (type === 'right') {
            if (this.props.isbgurl) {
                if (nowNum === -1) {
                    return
                }
                nowNum -= 1
                this.setState({
                    nowNum,
                    loading: true,
                    url: nowNum === -1 ? `${COMMON_URL}/file/gobgimg` : `${COMMON_URL}/go/bingimg?d=${nowNum}`
                })
            } else {
                if (nowNum === 0) {
                    return
                }
                nowNum -= 1
                this.setState({
                    nowNum,
                    loading: true,
                    url: `${COMMON_URL}/go/bingimg?d=${nowNum}`
                })
            }

        }
    }

    onLoad = () => {
        this.setState({
            loading: false
        })
    }

    /** 
     * 设置自定义背景
    */
    setBgUrlFile = (file) => {
        this.setState({
            loading: true,
        })
        getBase64(file, imageUrl =>
            this.setState({
                url: imageUrl,
                loading: false,
                nowNum: -1
            }),
        );
    }

    /** 
     * 加载网页设置背景
    */
    setBgUrlFist = (isbgurl) => {
        this.setState({
            url: isbgurl ? `${COMMON_URL}/file/gobgimg?&t=${Date.now()}` : `${COMMON_URL}/go/bingimg?d=0`,
            nowNum: isbgurl ? -1 : 0
        })
    }

    /** 
     * 还原背景
    */
    recoverBgUrl = () => {
        this.setState({
            loading: true,
            url: `${COMMON_URL}/go/bingimg?d=0&t=${Date.now()}`,
            nowNum: 0
        })
    }

    setOpacity = (value) => {
        this.setState({
            opacityValue: value * 0.1
        })
    }

    render() {

        let { url, nowNum, loading, opacityValue } = this.state

        let { isbgurl } = this.props

        let className = loading ? "input-bg-msk input-bg-msk-loading" : "input-bg-msk"

        let rightStyle = {}
        if (isbgurl) {
            if (nowNum === -1) {
                rightStyle = { 'opacity': '.4', 'cursor': 'default' }
            }
        } else {
            if (nowNum === 0) {
                rightStyle = { 'opacity': '.4', 'cursor': 'default' }
            }
        }
        return (
            <Fragment>
                <img alt="" className="input-bg" src={url} onLoad={this.onLoad} />
                <div className={className}></div>
                <div className="input-bg-btn" style={{ opacity: opacityValue }}>
                    <LeftCircleOutlined style={nowNum === 7 ? { 'opacity': '.4', 'cursor': 'default' } : {}}
                        title="上一张" onClick={() => this.setImg('left')} className="input-bg-btn-span" />
                    <RightCircleOutlined title="下一张" onClick={() => this.setImg('right')}
                        style={rightStyle}
                        className="input-bg-btn-span" />
                </div>
            </Fragment>

        );
    }
}
