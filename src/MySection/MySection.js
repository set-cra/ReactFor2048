import React , { Component } from 'react';
import './MySection.scss';
export default class MySection extends Component{
    constructor(props){
        super(props);
        //表格内容,初始为0,加载时为空字符串
        this.state={
            body:[
                [0,0,0,0],
                [0,0,0,0],
                [0,0,0,0],
                [0,0,0,0]
            ],
            //计数0位个数,只剩0位之后调用游戏结束验证方法
            empty : 16,
            //游戏是否结束标识,false时出现结束挡板和重新开始按钮
            game:true
        };
        //循环两次,我之前用了递归调用方法有时候返回结果会丢失...,
        //可能是有时候递归次数太多,时间久了,换成while试试
        //所以做了一次undefined判断,后面都差不多
        for(let key of new Array(2).keys()){
            let XY = this.getXY(key);
            let {x,y} = XY;
            //这个循环是在构造的时候就执行的,所以可以这样写,之后要用setState方法
            this.state.body[x][y] = this.getRandomNum();
        }
    }

    render(){
        return (
            //两次map循环,四次行,四次格
            <div onTouchStart={(e)=>this.remenberTouch(e)} onTouchEnd={(e)=>this.moveCell(e)}>
                {
                    this.state.body.map((value,index)=>{
                        return (
                            <div key ={'x'+index} className="row">
                                {
                                    value.map((value,i)=>{
                                        return (
                                            //0值时不显示
                                            <div key={'y'+i} className={'cell cell-'+value}>{value===0 ? '' : value}</div>
                                        )
                                    })

                                }
                            </div>
                        )
                    })
                }
                {/* game参数false时加载游戏失败页面 */}
                {
                    this.state.game ? 
                    ''
                    :
                    <div className="failed">
                        游戏失败<br/>
                        <span onTouchEnd={()=>this.resetGame()} className="reset">重置游戏</span>
                    </div>
                }
            </div>
        )
    }
    //随机初始值
    getRandomNum(){
        return [1,2,4][Math.floor(Math.random()*3)];
    }
    //随机空坐标
    getXY=()=>{
        while(1){
            let x = Math.floor(Math.random()*4);
            let y = Math.floor(Math.random()*4);
            if(this.state.body[x][y] === 0){
                return {
                    x,y
                }
            }
        }
    }
    //为空格添加随机初始值
    setEmptyCell=()=>{
        let empty;
        //获取数字的字符串,0或者0开头的个数就是空格的个数
        let str = (this.state.body.toString());
        let arr = str.match(/(^0)|(,0)/g);
        //如果获取不到正则匹配的数组就意味着不存在,即没有空格可以添加随机值,不执行下面的代码
        if(!arr){
            empty=0;
        }else{
            empty = (str.match(/(^0)|(,0)/g).length);
        }
        this.setState({empty});
        //当有空格时,随机添加随机数
        if(empty >0){
            let body = [...this.state.body];
            let XY = this.getXY();
            let {x,y} = XY;
            body[x][y] = this.getRandomNum();
            this.setState({body});
        }else{
            return;
        }
    }
    //记录开始触摸时的触摸触碰点坐标
    remenberTouch({touches}){
        let {clientX : X, clientY : Y} = touches[0]; 
        this.setState({
            X,Y
        });
    }
    //结束时的触摸点坐标
    moveCell({changedTouches}){
        let {clientX : X, clientY : Y} = changedTouches[0];
        if(this.state.X -X === 0 && this.state.Y - Y === 0) return;
        if(Math.abs(this.state.X -X) > Math.abs(this.state.Y - Y)){
            this.Xmove(this.state.X - X > 0);
        }else{
            this.Ymove(this.state.Y - Y > 0);
        }
    }
    //横排移动
    Xmove(bool){
        let x;
        let y;
        let body;
        if(bool){
            for(x=0;x<4;x++){
                for(y=1;y<4;y++){
                    let i = y;
                    if(this.state.body[x][y] === 0)continue;
                    while(i--){
                        if(this.state.body[x][i] === 0){
                            body = this.upDate(x,i,x,i+1,false);
                        }
                        if(this.state.body[x][i+1] === this.state.body[x][i]){
                            body = this.upDate(x,i,x,i+1);
                        }
                    }
                }
            }
        }else{
            for(x=0;x<4;x++){
                for(y=2;y>-1;y--){
                    if(this.state.body[x][y] === 0)continue;
                    let i = y;
                    while(i<3){
                        if(this.state.body[x][i+1] === 0){
                            body = this.upDate(x,i+1,x,i,false);
                        }
                        if(this.state.body[x][i] === this.state.body[x][i+1]){
                            body = this.upDate(x,i+1,x,i);
                        }
                        i++;
                    }
                }
            }
        }
        if(body){
            this.setEmptyCell();
        }
        this.setState(body);
        this.gameFailed();
    }
    //竖排移动
    Ymove(bool){
        let x;
        let y;
        let body;
        if(bool){
            for(y=0;y<4;y++){
                for(x=1;x<4;x++){
                    let i =x;
                    if(this.state.body[x][y] === 0)continue;
                    while(i--){
                        if(this.state.body[i][y] === 0){
                            body = this.upDate(i,y,i+1,y,false);
                        }
                        if(this.state.body[i][y] === this.state.body[i+1][y] && this.state.body[i][y] !== 0){
                            body = this.upDate(i,y,i+1,y);
                        }
                    }
                }
            }
        }else{
            for(y=0;y<4;y++){
                for(x=2;x>-1;x--){
                    let i = x;
                    if(this.state.body[x][y] === 0)continue;
                    while(i<3){
                        if(this.state.body[i+1][y] === 0){
                            body = this.upDate(i+1,y,i,y,false);
                        }
                        if(this.state.body[i][y] === this.state.body[i+1][y] && this.state.body[i][y] !== 0){
                            body = this.upDate(i+1,y,i,y);
                        }
                        i++;
                    }
                }
            }
        }
        if(body){
            this.setEmptyCell();
        }
        this.setState(body);
        this.gameFailed();
    }
    //数据更新,函数重用
    upDate(x1,y1,x2,y2,bool=true){
        let body = [...this.state.body];
        if(bool){
            body[x1][y1] *=2;
            body[x2][y2] = 0;
        }else{
            body[x1][y1] = body[x2][y2];
            body[x2][y2] = 0;
        }
        return body;
    }
    //重置游戏
    resetGame(){
        this.setState({
            body:[
                [0,0,0,0],
                [0,0,0,0],
                [0,0,0,0],
                [0,0,0,0]
            ]
        },()=>{
            this.setEmptyCell();
            this.setEmptyCell();
            this.setState({
                game:true
            });
        });
    }
    //游戏是否失败判定
    gameFailed=()=>{
        let {body , empty} = this.state;
        if(empty === 1){
            for(let x=0;x<4;x++){
                for(let y = 0; y<4;y++){
                    if(body[x][y] === 0) return;
                    if(body[x-1]) if(body[x][y]===body[x-1][y]) return;
                    if(body[x+1]) if(body[x][y]===body[x+1][y]) return;
                    if(body[x][y]===body[x][y+1]) return;
                    if(body[x][y]===body[x][y-1]) return;
                }
            }
            this.setState({
                game:false
            });
        }
    }
}