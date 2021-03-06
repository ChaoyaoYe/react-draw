import React, { PureComponent } from "react"
import styled from 'styled-components'

import { getGift } from './DrawData'

// common
const bgBorderColor = "#0066FF"
const bgColor = "#CCEEFF"
const grayColor = "#999999"
const activeColor = "#FFA488"
const btnBg = "#33CCFF"
const btnClickBg = "#FFA488"
const ClearFix = styled.div`
    &:before,&:after{
        display:table;
        content:'';
        clear:both;
    }
`;
const GrawTitle = styled.div`
    font-size:18px;
    color:${activeColor};
    text-align:center;
    font-weight:700;
    line-height:80px;
`;
const DrawWrap = styled.div`
    width:640px;
    margin:0 auto;
`;
const DrawBg = styled(ClearFix)`
    position:relative;
    width:596px;
    height:504px;
    padding:24px;
    margin:0 auto;
    border-radius:5px;
    border:1px solid ${bgBorderColor};
    background-color:${bgColor};
`;
const GiftBox = styled(ClearFix)`
    width:546px;
    height:454px;
    position:relative;
`;
const GiftItem = styled.div`
    width:86px;
    height:86px;
    position:absolute;
    left:${props => props.left};
    top:${props => props.top};
    z-index:10;
    display:inline-block;
    box-sizing:border-box;
    padding-top:10px;
    border-radius:5px;
    border:2px solid;
    border-color:${props => props.active ? activeColor : grayColor};
    background-color:${props => props.active ? "#146c8a" : "#ffffff"};

    .gift-name{
        text-align:center;
        font-size:14px;
        color:${props => props.active ? activeColor : grayColor};
    }
`;

const GiftImg = styled.div`
    width:48px;
    height:48px;
    margin:0 auto;
    background-image:url(${props => props.iconSrc});
`;

const DrawBtn = styled.button`
    outline:none;
    border:0;
    width:362px;
    height:270px;
    position:absolute;
    left:92px;
    top:92px;
    z-index:10;
    background-color:${props => props.isClicking ? btnClickBg : btnBg};
    border-radius:5px;
    cursor:pointer;
    padding:0;
    font-size:45px;
    /* color:${props => props.isClicking ? grayColor : activeColor}; */
`;

function GetDrawBtn({ isClicking, onClick }) {
    return <DrawBtn isClicking={isClicking} onClick={onClick}>{isClicking ? "抽奖中..." : "开始"}</DrawBtn>
}

// mock endStopIndex
function getRandomNum(min, max) {
    return Math.floor(Math.random() * (max - min + 1) + min);
}

class Draw extends PureComponent {
    constructor(props) {
        super(props)
        this.state = {
            giftList: getGift(),
            // 一圈的总长度，礼物总数量
            stepCount: getGift().length,
            // 剩余抽奖次数，接口返回
            myCount: 5,
            // 转动激活位置默认：1，动态，可设置(>=1&&<=stepCount)
            activeIndex: 1,
            // 最终要停下的位置：接口返回(>=1&&<=stepCount)
            endStopIndex: 14,
            // 抽奖是否正在进行中
            isDrawing: false,
            // 转速   分别为最后0,1,2,3,4,5圈的转速
            speed: [336, 168, 84, 42, 42, 42],
            // 已经得到本次抽奖结果了
            getResultFinish: false,
        };
        // 开启转盘的定时器
        this.timer = null;
    }
    componentWillUnmount() {
        if (this.timer) {
            clearTimeout(this.timer)
        }
    }
    startDraw = e => {
        // 抽奖进行中禁止点击，抽奖次数<=0禁止点击
        const _this = this;
        let { isDrawing, myCount } = this.state;
        if (isDrawing) {
            window.alert(`抽奖进行中，请稍后再试`);
        } else {
            if (myCount <= 0) {
                window.alert(`抽奖次数不足!`);
            } else {
                // 开启转盘
                this.setState({ isDrawing: false }, this.startRun);
                // 假装发了一个ajax请求
                setTimeout(function(){
                    let endStopIndex = getRandomNum(1, 18);
                    _this.setState({getResultFinish:true, endStopIndex});
                }, 3000);
            }
        }
    }
    startRun(){
        // 转一圈又一圈
        // 直到知道结果，慢慢变慢速度，停在结果那;
        // 转盘听到结果值时，重置初始值（{isDrawing:false, getResultFinish:false}）；
        const _this = this;
        const {stepCount, speed} = this.state;
        let {activeIndex} = this.state;
        /*
        * Function addOneStep
        * 奖品位置移动一小步
        * @shouldContinue   {Booleans}  是否应该继续这个定时器
        * @leftRound        {Number}    剩余几圈  3代表一个无限大的值，因为还不知道结果
        */
        function addOneStep(params) {
            activeIndex += 1;
            let {shouldContinue, leftRound} = params;

            if(shouldContinue) {
                // 如果到超过奖品个数，重置为1
                if(activeIndex > stepCount) {
                    if(_this.state.getResultFinish){
                        leftRound -= 1;
                    }
                    activeIndex = 1;
                }
                // 如果已经到最后一圈了  且  已经到了制定要中奖的位置了  就不需要继续了
                if(leftRound === 0 &&  activeIndex === _this.state.endStopIndex){
                    shouldContinue = false;
                }
                _this.setState({activeIndex});
                const nextParams = {
                    shouldContinue,
                    leftRound,
                };
                _this.timer = setTimeout(addOneStep.bind(this, nextParams), speed[leftRound]);
            }else {
                _this.setState({isDrawing:false, getResultFinish:false});
            }
        }
        addOneStep({shouldContinue:true, leftRound:5});
    }
    render() {
        // readonly
        const { giftList, activeIndex, isDrawing, myCount } = this.state;
        const getIsActive = (item) => (
            item.id === activeIndex ? 1 : 0
        )
        return (
            <div className="draw-box">
                <DrawWrap>
                    <GrawTitle>抽奖次数：{myCount}</GrawTitle>
                    <DrawBg>
                        <GiftBox>
                            {
                                giftList.map((gift, index) =>
                                    <GiftItem active={getIsActive(gift)}
                                        iconSrc={gift.icon}
                                        left={gift.left}
                                        top={gift.top}
                                        key={index}>
                                        <GiftImg iconSrc={gift.icon}></GiftImg>
                                        <div className="gift-name">{gift.name}X{gift.count}</div>
                                    </GiftItem>
                                )
                            }
                            <GetDrawBtn isClicking={isDrawing} onClick={this.startDraw} />
                        </GiftBox>
                    </DrawBg>
                </DrawWrap>
            </div>
        )
    }
}

export default Draw