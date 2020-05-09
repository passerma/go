import React from 'react';
import './InputSet.less';
import { SettingOutlined, CommentOutlined, UserOutlined, LockOutlined, LoadingOutlined, PlusOutlined } from '@ant-design/icons';
import { Menu, Dropdown, Switch, Button, message, Modal, Input, Form, Divider, Upload, Slider } from 'antd';
import { COMMON_URL, FetchData } from '../api/api'
import { getBase64 } from '../api/globalFunc'

class InputBg extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            loading: false,
            loginVisible: false,
            centerVisible: false,
            setVisible: false,
            loadingOut: false,
            loadingSet: false,
            loadingBg: false,
            imageUrl: '',
            loadingBgSwitch: false,
        };
        this.formRef = React.createRef();
    }

    componentDidUpdate(prevProps) {

    }

    /** 
     * 清除历史纪录
    */
    clear = () => {
        message.success('清除成功', 2)
        this.props.clearHistory()
    }

    /** 
     * 设置保存历史纪录
    */
    setRemeber = (checked) => {
        this.props.setRemeber(checked)
    }

    /** 
     * 设置透明度
    */
    opacityChange = (value) => {
        this.props.setOpacity(value)
    }
    /** 
     * 弹窗控制
    */
    setVisibleChange = (visible) => {
        let { loginVisible, centerVisible } = this.state
        if (loginVisible || centerVisible) {
            return
        }
        this.setState({
            setVisible: visible
        })
    }

    /** 
     * 取消
    */
    handleCancel = (type) => {
        this.setState({
            loginVisible: false,
            centerVisible: false
        })
    }

    //#region 登陆相关
    /** 
     * 登陆完成
    */
    onFinish = values => {
        this.setState({
            loading: true
        })
        let url = '/go/login'
        let username = values.username
        let password = values.password
        let params = {
            method: "POST",
            headers: {
                'content-type': 'application/json'
            },
            body: JSON.stringify({
                username,
                password
            })
        }
        FetchData(url, params, (res) => {
            if (res && res.ErrCode === 0) {
                this.setState({
                    loading: false,
                    loginVisible: false
                })
                message.success(`欢迎回来${res.data.realname}`)
                this.props.setLogin(true, res.data)
            } else {
                this.setState({
                    loading: false
                })
                if (res) {
                    message.error(res.ErrMsg)
                }
            }
        })
    };

    /** 
     * 退出登录
    */
    loginOut = () => {
        this.setState({
            loadingOut: true
        })
        let url = '/user/loginout'
        let params = {
            method: "PUT",
        }
        FetchData(url, params, (res) => {
            if (res && res.ErrCode === 0) {
                this.setState({
                    loadingOut: false,
                    centerVisible: false
                })
                message.success('退出成功')
                this.props.setLogin(false, {})
            } else {
                this.setState({
                    loadingOut: false
                })
                if (res) {
                    message.error(res.ErrMsg)
                }
            }
        })
    }
    //#endregion

    //#region 表单相关
    /** 
     * 设置完成
    */
    onFinishCenter = (values) => {
        this.setState({
            loadingSet: true
        })
        let url = '/go/set'
        let ishistory = values.switchHistory
        let islike = values.switchLike
        let params = {
            method: "POST",
            headers: {
                'content-type': 'application/json'
            },
            body: JSON.stringify({
                ishistory,
                islike
            })
        }
        FetchData(url, params, (res) => {
            if (res && res.ErrCode === 0) {
                message.success('设置成功')
                this.props.setChange(ishistory, islike, res.data)
            } else {
                if (res) {
                    message.error(res.ErrMsg)
                }
            }
            this.setState({
                loadingSet: false
            })
        })
    }
    //#endregion

    //#region 背景图相关
    beforeUpload = (file) => {
        const isJpgOrPng = file.type === 'image/jpeg' || file.type === 'image/png';
        if (!isJpgOrPng) {
            message.error('仅支持上传JPG和PNG文件！');
        }
        const isLt2M = file.size / 1024 / 1024 < 2;
        if (!isLt2M) {
            message.error('仅支持上传2MB以内大小文件！');
        }
        return isJpgOrPng && isLt2M;
    }

    /** 
     * 提交
    */
    handleChange = info => {
        if (info.file.status === 'uploading') {
            this.setState({ loadingBg: true });
            return;
        }
        if (info.file.status === 'done') {
            this.props.setBgUrlFile(info.file.originFileObj)
            getBase64(info.file.originFileObj, imageUrl =>
                this.setState({
                    imageUrl,
                    loadingBg: false,
                }),
            );
        }
    }

    /** 
     * 设置背景图
    */
    setBgUrl = () => {
        this.setState({
            loadingBgSwitch: true
        })
        let url = '/go/setbgurl'
        let params = {
            method: "POST",
            headers: {
                'content-type': 'application/json'
            }
        }
        FetchData(url, params, (res) => {
            if (res && res.ErrCode === 0) {
                this.setState({
                    loadingBgSwitch: false
                })
                this.props.recoverBgUrl()
                message.success('还原初始背景成功')
            } else {
                this.setState({
                    loadingBgSwitch: false
                })
                if (res) {
                    message.error(res.ErrMsg)
                }
            }
        })
    }
    //#endregion

    render() {

        let { islogin, userInfo, opacityValue } = this.props
        let { loginVisible, loading, centerVisible, setVisible, loadingOut, loadingSet, loadingBg, imageUrl,
            loadingBgSwitch } = this.state

        let menu = <Menu>
            <Menu.Item key="0">
                <div className="input-set-item-swich">
                    <span className="input-set-item-span">记录搜索历史</span>
                    <Switch onClick={this.setRemeber} checkedChildren="开" unCheckedChildren="关"
                        defaultChecked={this.props.remeber} />
                </div>
            </Menu.Item>
            <Menu.Item key="1">
                <div className="input-set-item-btn">
                    <span className="input-set-item-span">清空搜索历史</span>
                    <Button onClick={this.clear} danger>清空</Button>
                </div>
            </Menu.Item>
            <Menu.Item key="2">
                <div className="input-set-item-slider">
                    <span>透明度</span>
                    <Slider min={1} max={10} value={opacityValue * 10} onChange={this.opacityChange} />
                </div>
            </Menu.Item>
            <Menu.Item key="3">
                {
                    islogin ? <div className="input-set-item-text" onClick={(e) => {
                        e.stopPropagation();
                        this.setState({ centerVisible: true })
                    }}>
                        <span>设置</span>
                        <img alt="头像" src={`${COMMON_URL}/file/get/avatar?avatar=${userInfo.avatar}`} />
                    </div>
                        : <div className="input-set-item-text" onClick={(e) => {
                            e.stopPropagation();
                            this.setState({ loginVisible: true })
                        }}>
                            <span>登录</span>
                            <UserOutlined />
                        </div>
                }
            </Menu.Item>
            <Menu.Item key="4">
                <div className="input-set-item-text" onClick={(e) => {
                    e.stopPropagation();
                    window.open('https://www.passerma.com/article/53')
                }}>
                    <span>反馈</span>
                    <CommentOutlined />
                </div>
            </Menu.Item>
        </Menu>

        const uploadButton = (
            <div>
                {loadingBg ? <LoadingOutlined /> : <PlusOutlined />}
                <div className="ant-upload-text">上传背景图片</div>
            </div>
        );

        return (
            <div className="input-set-box" style={{ opacity: opacityValue }}>
                <SettingOutlined className="input-set" />
                <Dropdown overlayStyle={(loginVisible || centerVisible) && { 'zIndex': '999' }}
                    overlay={menu} trigger={['click']} visible={setVisible} onVisibleChange={this.setVisibleChange}>
                    <SettingOutlined className="input-set" />
                </Dropdown>
                <Modal
                    title="登录"
                    wrapClassName="input-set-login"
                    visible={loginVisible}
                    centered
                    footer={null}
                    forceRender
                    width="300"
                    onCancel={this.handleCancel}
                >
                    <Form
                        name="normal_login"
                        className="login-form"
                        onFinish={this.onFinish}
                    >
                        <Form.Item
                            name="username"
                            rules={[{ required: true, message: '请输入邮箱' }]}
                        >
                            <Input prefix={<UserOutlined className="site-form-item-icon" />} placeholder="邮箱" />
                        </Form.Item>
                        <Form.Item
                            name="password"
                            rules={[{ required: true, message: '请输入密码' }]}
                        >
                            <Input
                                prefix={<LockOutlined className="site-form-item-icon" />}
                                type="password"
                                placeholder="密码"
                            />
                        </Form.Item>
                        <Form.Item className="login-form-btn">
                            <Button loading={loading} type="primary" htmlType="submit" className="login-form-button">
                                登录
                            </Button>
                            <div className="login-form-more">
                                <span onClick={() => window.open('https://www.passerma.com/register')}>去注册</span>
                                <span onClick={() => window.open('https://www.passerma.com/forgot')}>忘记密码</span>
                            </div>
                        </Form.Item>
                    </Form>
                </Modal>
                <Modal
                    title="设置"
                    wrapClassName="input-set-center"
                    visible={centerVisible}
                    centered
                    destroyOnClose
                    footer={null}
                    width="300px"
                    onCancel={this.handleCancel}
                >
                    <Form
                        name="normal_center"
                        className="center-form"
                        initialValues={{
                            switchHistory: this.props.ishistory ? true : false,
                            switchLike: this.props.islike ? true : false
                        }}
                        onFinish={this.onFinishCenter}
                        ref={this.formRef}
                    >
                        <Form.Item name="switchHistory" label="同步历史纪录" valuePropName="checked" className="center-form-switch">
                            <Switch checkedChildren="开" unCheckedChildren="关" />
                        </Form.Item>
                        <Form.Item name="switchLike" label="同步收藏网址" valuePropName="checked" className="center-form-switch">
                            <Switch checkedChildren="开" unCheckedChildren="关" />
                        </Form.Item>
                        <Form.Item className="login-form-btn">
                            <Button loading={loadingSet} type="primary" htmlType="submit" className="login-form-button">
                                提交修改
                            </Button>
                        </Form.Item>
                    </Form>
                    <Divider />
                    <div name="switchBgUrl" className="login-form-uploader">
                        <Upload
                            name="goimg"
                            listType="picture-card"
                            showUploadList={false}
                            className="uploader-box"
                            withCredentials
                            action={`${COMMON_URL}/file/gobgimg`}
                            beforeUpload={this.beforeUpload}
                            onChange={this.handleChange}
                        >
                            {imageUrl ? <img src={imageUrl} alt="背景图" style={{ width: '100%' }} /> : uploadButton}
                        </Upload>
                        <div className="uploader-text">
                            <Button loading={loadingBgSwitch} onClick={this.setBgUrl}>还原初始背景</Button>
                        </div>
                    </div>
                    <div className="login-form-btn" style={{ 'marginBottom': '10px' }}>
                        <a style={{ 'textDecoration': 'none' }} rel="nofollow me noopener noreferrer" target="_blank"
                            href="https://www.passerma.com/center">个人中心</a>
                    </div>
                    <div className="login-form-btn">
                        <Button loading={loadingOut} type="primary" danger onClick={this.loginOut}>注销</Button>
                    </div>
                </Modal>
            </div>

        )
    }
}

export default InputBg