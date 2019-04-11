import React from 'react';
import ReactDOM from 'react-dom';
import dva, { connect } from 'dva';
import { LocaleProvider, DatePicker, message,Upload, Icon,Spin ,Button,Select} from 'antd';
// 由于 antd 组件的默认文案是英文，所以需要修改为中文
import zhCN from 'antd/lib/locale-provider/zh_CN';
import moment from 'moment';
import 'moment/locale/zh-cn';
import { openS,closeS,searchS} from './services/api';

moment.locale('zh-cn');

const defaultPort=8101;

class MyUpload extends React.Component {
    state = {
        serviceChange: true,
        serviceStatus: undefined,
        loadingTip: "查询服务状态",
        fileList: [],
        port: defaultPort,
    };

    constructor(props) {
        super(props);


        this.state = {
            date: '',
        };
    }

    // componentDidMount(){

    // }

    componentDidMount() {
        try{
            const tableCon = ReactDOM.findDOMNode(this.refs['table']);
            const table = tableCon.querySelector('table');
            table.setAttribute('id','table-to-xls');
        }
        catch (e) {
            console.error(e);
        }


        const {dispatch} = this.props;
        message.success(`正在查询服务开启状态...`);
        dispatch({
            type: 'service/searchS',
            payload: defaultPort,
            callback: (v) => {
                console.log(`${this.state.port}服务开启状态:${v}`);
                if (v === 1) {
                    this.setState({serviceChange: false, serviceStatus: true});
                    this.forceUpdate();
                }
                else {
                    this.setState({serviceChange: false, serviceStatus: false});
                }
                // message.success(JSON.stringify(v));
            },
        });
        // this.refs.table.refs.table.width='20%';
        // const tableCon = ReactDOM.findDOMNode(this.refs['tables']);
        // const table = tableCon.querySelector('table');
        // this.refs.table.setAttribute('id','table-to-xls');
    }

    handleChange = info => {
        let fileList = info.fileList;
        // message.success(JSON.stringify(fileList));
        // 1. Limit the number of uploaded files
        // Only to show two recent uploaded files, and old ones will be replaced by the new
        // fileList = fileList.slice(-2);

        // 2. Read from response and show file link
        fileList = fileList.map(file => {

            if (file.response) {
                file.name = file.response.data.fileBeforeName + " " + file.response.data.label_str;
                console.log(JSON.stringify(file.response));
                if (file.response.code == 0) {
                    file.uid = file.response.data.id;
                    if (file.response.data.num > 0) {
                        file.status = 'done';
                        file.url = file.response.data.url;
                    }
                    else {
                        file.name = file.response.data.fileBeforeName + " (无瑕疵)";
                        file.status = 'done';
                        file.url = file.response.data.url;
                    }
                    // else file.status='error';
                }
                else {
                    file.status = 'error';
                    file.name = file.response.data.fileBeforeName + " (无法识别)";
                }
                // Component will show file.url as link
                // file.url = file.response.url;
            }
            return file;
        });
        // message.success(JSON.stringify(fileList));
        // 3. Filter successfully uploaded files according to response from server
        // fileList = fileList.filter(file => {
        //     if (file.response) {
        //         return file.response.status === "success";
        //     }
        //     return true;
        // });
        this.setState({fileList});
    };

    closeOnChange=()=>{
        const {dispatch} = this.props;
        this.setState({serviceChange: true});
        message.success(`正在关闭服务...`);
        dispatch({
            type: 'service/closeS',
            payload: this.state.port===undefined?8101:this.state.port,
            callback: (v) => {
                if (v === 1) {
                    let i = 0;
                    while (i < 3) {
                        this.timer = setTimeout(
                            () => {
                                dispatch({
                                    type: 'service/searchS',
                                    payload: this.state.port===undefined?8101:this.state.port,
                                    callback: (v) => {
                                        if (v === 0) {
                                            this.setState({serviceChange:false,serviceStatus:false});
                                        }
                                        else {
                                            message.error("关闭失败");
                                            this.setState({serviceChange:false,serviceStatus:true});
                                        }
                                    },
                                });
                            },
                            5000
                        );
                        i++;
                    }
                }
                else {
                    message.error("关闭失败");
                    this.setState({serviceChange:false,serviceStatus:true});
                }
            },
        });
    }

    searchOnChange = () => {
        const {dispatch} = this.props;
        this.setState({serviceChange: true});
        message.success(`正在查询服务....`);
        // const { dispatch } = props;
        dispatch({
            type: 'service/searchS',
            payload: this.state.port===undefined?8101:this.state.port,
            callback: (v) => {
                if (v === 1) {
                    message.success("当前服务已经开启");
                    this.setState({serviceChange:false,serviceStatus:true});
                }
                else{
                    message.success("当前服务已经关闭");
                    this.setState({serviceChange:false,serviceStatus:false});
                }
            },
        });


    };

    selectHandleChange=(value)=> {
        this.setState({port:value});
        console.log(`selected ${value}`);
    };

    openOnChange = () => {
        const {dispatch} = this.props;
        this.setState({serviceChange: true});
        message.success(`正在开启服务....`);
        // const { dispatch } = props;
        dispatch({
            type: 'service/openS',
            payload: this.state.port===undefined?8101:this.state.port,
            callback: (v) => {
                if (v === 1) {
                    let i = 0;
                    while (i < 3) {
                        this.timer = setTimeout(
                            () => {
                                // message.success(`开始执行查询${i}`);
                                dispatch({
                                    type: 'service/searchS',
                                    payload: this.state.port===undefined?8101:this.state.port,
                                    callback: (v) => {
                                        if (v === 1) {
                                            this.setState({serviceChange:false,serviceStatus:true});
                                        }
                                        else {
                                            message.error("开启失败");
                                            this.setState({serviceChange:false,serviceStatus:false});
                                        }
                                    },
                                });
                                },
                            5000
                        );
                        // setTimeout(message.success(`开始执行查询${i}`),1000);
                        if(this.state.serviceStatus===true)break;
                        i++;
                    }
                }
                else {
                    message.error("开启失败");
                    this.setState({serviceChange:false,serviceStatus:false});
                }
            },
        });


    };

    render() {
        const Dragger = Upload.Dragger;
        const pp = {
		action: `//pcbdemo.api.galileo-ai.com:7001/pcb/testing?port=${this.state.port===undefined?8101:this.state.port}`,
            onChange: this.handleChange,
            multiple: true,
            accept: 'image/*',
        };
        console.log(`服务状态:${JSON.stringify(this.state.serviceStatus)}`);
        return (
            <LocaleProvider locale={zhCN}>
                <Spin spinning={this.state.serviceChange}
                      tip={`loading.....${this.state.loadingTip === undefined ? "查询服务状态" : this.state.loadingTip}`}>
                    <div style={{width: '50%', margin: '100px auto'}}>
                        端口:
                        <Select defaultValue={defaultPort} style={{ width: 120 }} onChange={this.selectHandleChange}>
                            <Option value="8097">8097</Option>
                            <Option value="8098">8098</Option>
                            <Option value="8099">8099</Option>
                            <Option value="8100">8100</Option>
                            <Option value="8101">8101</Option>
                            <Option value="8102">8102</Option>
                            <Option value="8103">8103</Option>
                            <Option value="8104">8104</Option>
                            <Option value="8105">8105</Option>
                            <Option value="8106">8106</Option>
                        </Select>
                        <div>
                            服务状态:{this.state.serviceStatus===undefined?<div><Icon type="mth" theme="twoTone" twoToneColor="#ff8c00"/>未知</div>:this.state.serviceStatus===true?<div><Icon type="smile" theme="twoTone" twoToneColor="#52c41a"/>开启</div>: <div><Icon type="frown" theme="twoTone" twoToneColor="#eb2f96"/>关闭</div>}
                        </div>
                        <div>
                            {(this.state.serviceStatus!==undefined&&this.state.serviceStatus===true?
                                <Button type="primary" size="small" onClick={this.closeOnChange}>关闭</Button>:
                                <Button type="primary" size="small" onClick={this.openOnChange}>开启</Button>)}
                            <Button id="table-to-xls" style={{ marginLeft: 8 }} type="primary" size="small" onClick={this.searchOnChange}>手动查询服务状态</Button>
                        </div>
                        <Dragger {...pp} fileList={this.state.fileList}>
                            <p className="ant-upload-drag-icon">
                                <Icon type="inbox"/>
                            </p>
                            <p className="ant-upload-text">{`面板识别-检测点${this.state.port === 8097 ? 1 : this.state.port === 8098 ? 2 : this.state.port === 8099 ? 3 : this.state.port === 8100 ? 4 : ""}`}</p>
                            <p className="ant-upload-hint">批量上传图片请点击或者拖放文件到该区域,支持单个或者批量的文件</p>
                        </Dragger>
                    </div>
                </Spin>
            </LocaleProvider>
        );
    }
}

// 1. Initialize
const app = dva();
console.log(2);
// 2. Model
// app.model(require('./src/models/service').default);
app.model({
    namespace: 'service',
    state: 0,
    effects: {
        *openS({ payload ,callback}, { call, put }) {
            const response = yield call(openS, payload);
            if (callback) callback(response);
        },
        *closeS({ payload ,callback}, { call, put }) {
            const response = yield call(closeS, payload);
            if (callback) callback(response);
        },
        *searchS({ payload ,callback}, { call, put }) {
            const response = yield call(searchS, payload);
            if (callback) callback(response);
        },
    },
    reducers: {
        add  (count) { return count + 1 },
        minus(count) { return count - 1 },
    },
});
// 3. View
const App = connect(({ service }) => ({
    service
}))(function(props) {

    const { dispatch } = props;
    return (
        <div>
            <MyUpload dispatch={dispatch}/>
        </div>
    );
});

// 4. Router
app.router(() => <App />);

// 5. Start
app.start('#root');



// ReactDOM.render(<App />, document.getElementById('root'));
