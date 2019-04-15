import React from 'react';
import ReactDOM from 'react-dom';
import dva, { connect } from 'dva';
import { Tag, Row, Col, Table, message, Divider, Icon,Spin ,Button,Select} from 'antd';
// 由于 antd 组件的默认文案是英文，所以需要修改为中文
import zhCN from 'antd/lib/locale-provider/zh_CN';
import moment from 'moment';
import 'moment/locale/zh-cn';
import { getFishs, getAppointKey, updateFishStatus, delFish} from './services/api';

moment.locale('zh-cn');

class FreeFish extends React.Component {
    state = {
        selectedRowKeys: [], // Check here to configure the default column
        pagination: {defaultPageSize:100},
        loading: false,
    };

    onSelectChange = (selectedRowKeys) => {
        console.log('selectedRowKeys changed: ', selectedRowKeys);
        this.setState({ selectedRowKeys });
    };

    componentDidMount() {
        // try{
        //     const tableCon = ReactDOM.findDOMNode(this.refs['table']);
        //     const table = tableCon.querySelector('table');
        //     table.setAttribute('id','table-to-xls');
        // }
        // catch (e) {
        //     // console.error(e);
        // }
        const {dispatch} = this.props;
        message.success(`正在加载`);
        dispatch({
            type: 'service/getAppointKey',
            callback: (v) => {
                dispatch({
                    type: 'service/getFishs',
                    payload: {
                        showTip: 0,
                        page: 0,
                        size: 100,
                    },
                    callback: (v) => {
                        this.setState({
                            ...this.state,
                            pagination:{
                                ...this.state.pagination,
                                total: v["data"]["totalElements"]
                            }
                        });
                        console.log(`${JSON.stringify(v)}`);
                },
                });
            }
        });
        // dispatch({
        //     type: 'service/getFishs',
        //     payload: {
        //         page: 0,
        //         size: 10,
        //     },
        //     callback: (v) => {
        //         console.log(`服务开启状态:${v}`);
        //         message.success(JSON.stringify(v));
            // },
        // });
    }

    handleTableChange = (pagination, filters, sorter) => {
        const pager = { ...this.state.pagination };
        pager.current = pagination.current;
        this.setState({
            pagination: pager,
        });

        const {dispatch} = this.props;
        console.log("filters"+filters.appointKey.length+" !"+JSON.stringify(filters));
        dispatch({
            type: 'service/getFishs',
            payload: {
                showTip: 0,
                appointKeyId: filters.appointKey.length>0?filters.appointKey[0]:undefined,
                page: pager.current-1,
                size: 100,
            },
            callback: (v) => {
                this.setState({
                    ...this.state,
                    pagination:{
                        ...this.state.pagination,
                        total: v["data"]["totalElements"]
                    }
                });
                console.log(`${JSON.stringify(v)}`);
            },
        });
        // this.fetch({
        //     results: pagination.pageSize,
        //     page: pagination.current,
        //     sortField: sorter.field,
        //     sortOrder: sorter.order,
        //     ...filters,
        // });
    };

    render() {
        const {
            service: { list: { data }, keylist }
        } = this.props;

        let filters = keylist.data.map(function(item){
                return {text: `[${item["status"]===1?"开启":"关闭"}] ${item["key"]}`, value: item["id"]};
        });

        const columns = [{
            title: '关键字',
            dataIndex: 'appointKey',
            filters: filters,
            render: v => v['key'],
        }, {
            title: '查询时间',
            dataIndex: 'searchTime',
        }, {
            title: '距离现在',
            dataIndex: 'distance',
        }, {
            title: '标题',
            dataIndex: 'title',
        }, {
            title: '初始价钱',
            dataIndex: 'price',
        }, {
            title: '当前价',
            dataIndex: 'nowPrice',
        }, {
            title: '涨跌',
            dataIndex: 'remark',
        }, {
            title: '发布人',
            dataIndex: 'userNick',
        }, {
            title: '地址',
            dataIndex: 'location',
        }, {
            title: '来源',
            dataIndex: 'froms',
            render: v => {
                if(v === 1) return <Tag color="#87d068">闲鱼</Tag>;
                else if(v === 2) return  <Tag color="#f50">转转</Tag>;
                else return  <Tag>未知</Tag>;
            }
        }];


        const { selectedRowKeys } = this.state;
        const rowSelection = {
            selectedRowKeys,
            onChange: this.onSelectChange,
            hideDefaultSelections: true,
            selections: [{
                key: 'all-data',
                text: 'Select All Data',
                onSelect: () => {
                    this.setState({
                        selectedRowKeys: [...Array(46).keys()], // 0...45
                    });
                },
            }, {
                key: 'odd',
                text: 'Select Odd Row',
                onSelect: (changableRowKeys) => {
                    let newSelectedRowKeys = [];
                    newSelectedRowKeys = changableRowKeys.filter((key, index) => {
                        if (index % 2 !== 0) {
                            return false;
                        }
                        return true;
                    });
                    this.setState({ selectedRowKeys: newSelectedRowKeys });
                },
            }, {
                key: 'even',
                text: 'Select Even Row',
                onSelect: (changableRowKeys) => {
                    let newSelectedRowKeys = [];
                    newSelectedRowKeys = changableRowKeys.filter((key, index) => {
                        if (index % 2 !== 0) {
                            return true;
                        }
                        return false;
                    });
                    this.setState({ selectedRowKeys: newSelectedRowKeys });
                },
            }],
            onSelection: this.onSelection,
        };
        return (
            <Table size={"small"} rowSelection={rowSelection} columns={columns} dataSource={data.content} onChange={this.handleTableChange}
                   expandedRowRender={record => {
                       return(
                           <Row>
                               <Row>
                                   <Button type="primary" size="small" style={{marginLeft: 10}}>Primary</Button>
                                   <Button type="primary" size="small" style={{marginLeft: 10}}>Primary</Button>
                                   <Button type="primary" size="small" style={{marginLeft: 10}}>Primary</Button>
                               </Row>
                               <Row>
                                   <Divider/>
                               </Row>
                               <Row>
                                   <a href={record.url} target="view_window" style={{ margin: 0 }}>{record.description}</a>
                               </Row>
                           </Row>
                       )
                   }}
                   expandRowByClick
                   pagination={this.state.pagination}/>
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
    state: {
        res: {
            code: undefined,
            status: undefined,
            msg: '',
            data: [],
        },
        list: {
            code: undefined,
            status: undefined,
            msg: '',
            data: [],
        },
        keylist: {
            code: undefined,
            status: undefined,
            msg: '',
            data: [],
        },
    },
    effects: {
        *getFishs({ payload,callback}, { call, put }) {
            const response = yield call(getFishs,payload);
            yield put({
                type: 'list',
                payload: response,
            });
            if (callback)callback(response);
        },
        *getAppointKey({ callback}, { call, put }) {
            const response = yield call(getAppointKey);
            console.log(JSON.stringify(response));
            yield put({
                type: 'keylist',
                payload: response,
            });
            if (callback)callback(response);
        },
        *updateFishStatus({ payload,callback}, { call, put }) {
            const response = yield call(updateFishStatus,payload);
            yield put({
                type: 'res',
                payload: response,
            });
            if (callback)callback(response);
        },
        *delFish({ payload,callback}, { call, put }) {
            const response = yield call(delFish,payload);
            yield put({
                type: 'res',
                payload: response,
            });
            if (callback)callback(response);
        },
    },
    reducers: {
        res(state, action) {
            return {
                ...state,
                res: action.payload,
            };
        },
        list(state, action) {
            return {
                ...state,
                list: action.payload,
            };
        },
        keylist(state, action) {
            return {
                ...state,
                keylist: action.payload,
            };
        },
    },
});
// 3. View
const App = connect(({ service }) => ({
    service
}))(function(props) {
    const { dispatch } = props;
    return (
        <div>
            <FreeFish {...props}/>
        </div>
    );
});

// 4. Router
app.router(() => <App />);

// 5. Start
app.start('#root');



// ReactDOM.render(<App />, document.getElementById('root'));
