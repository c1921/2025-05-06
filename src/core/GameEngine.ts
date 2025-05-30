import { ref, watch } from 'vue';
import { generateRandomRoles } from '../utils/roleUtils';
import type { Role } from '../types/Role';
import { processNoonFoodConsumption, isHungry } from './FoodConsumptionSystem';
import { taskSystem } from './TaskSystem';

/**
 * GameEngine 管理游戏的核心逻辑
 * 负责调度各个系统和管理游戏状态
 */
export class GameEngine {
  
  // 游戏角色
  private roles = ref<Role[]>([]);
  
  // 游戏当前时间
  private currentYear = ref(2025);
  private currentMonth = ref(1);
  private currentDay = ref(1);
  private currentHour = ref(0);
  
  // 上次食物消耗的日期
  private lastFoodConsumptionDay = ref(0);
  
  // 事件触发器
  private eventHandlers = new Map<string, Function[]>();
  
  constructor(initialRoleCount: number = 10) {
    // 初始化游戏数据
    this.initialize(initialRoleCount);
    
    // 监听时间变化
    this.setupTimeWatchers();
  }
  
  /**
   * 初始化游戏
   * @param roleCount 初始角色数量
   */
  private initialize(roleCount: number): void {
    // 生成初始角色
    this.roles.value = generateRandomRoles(roleCount);
    
    // 设置起始日期 - 初始化为0，确保第一天也会触发食物消耗
    this.lastFoodConsumptionDay.value = 0;
    
    // 初始化角色工作状态
    this.initializeRoleWorkState();
  }
  
  /**
   * 初始化角色工作状态
   */
  private initializeRoleWorkState(): void {
    for (const role of this.roles.value) {
      // 如果角色没有工作状态，为其创建
      if (!role.workState) {
        role.workState = {
          efficiency: 100,       // 默认效率100%
          stamina: 100,          // 满体力
          lastRestTime: new Date(),
          taskHistory: [],
          preferredTaskTypes: [] // 暂无偏好
        };
      }
      
      // 初始化工作相关属性
      role.currentTaskId = null;
      role.location = null;
      role.isAvailable = true;
    }
  }
  
  /**
   * 设置时间变化的监听器
   */
  private setupTimeWatchers(): void {
    // 监听小时变化，检查是否到中午12点
    watch([this.currentHour, this.currentDay], 
      ([newHour, newDay], [oldHour]) => {
        // 检查是否到了中午12点，且是新的一天
        if (newHour === 12 && oldHour !== 12 && newDay !== this.lastFoodConsumptionDay.value) {
          this.onNoonArrived();
        }
        
        // 通知工作系统时间更新
        taskSystem.onTimeUpdate(newHour, newDay, this.roles.value);
      }
    );
    
    // 监听日期变化，触发每日事件
    watch([this.currentDay, this.currentMonth, this.currentYear], 
      ([newDay, newMonth, newYear], [oldDay, oldMonth, oldYear]) => {
        // 当日期变化时，触发每日事件
        if (newDay !== oldDay || newMonth !== oldMonth || newYear !== oldYear) {
          this.onDayChanged();
        }
      }
    );
  }
  
  /**
   * 获取当前游戏日期字符串
   */
  public getCurrentDateString(): string {
    const month = this.currentMonth.value.toString().padStart(2, '0');
    const day = this.currentDay.value.toString().padStart(2, '0');
    return `${this.currentYear.value}-${month}-${day}`;
  }
  
  /**
   * 获取当前游戏时间字符串
   */
  public getCurrentTimeString(): string {
    const hour = this.currentHour.value.toString().padStart(2, '0');
    return `${this.getCurrentDateString()} ${hour}:00`;
  }
  
  /**
   * 添加事件监听器
   * @param eventName 事件名称
   * @param handler 事件处理函数
   */
  public addEventListener(eventName: string, handler: Function): void {
    if (!this.eventHandlers.has(eventName)) {
      this.eventHandlers.set(eventName, []);
    }
    this.eventHandlers.get(eventName)?.push(handler);
  }
  
  /**
   * 触发事件
   * @param eventName 事件名称
   * @param args 事件参数
   */
  private triggerEvent(eventName: string, ...args: any[]): void {
    const handlers = this.eventHandlers.get(eventName) || [];
    for (const handler of handlers) {
      handler(...args);
    }
  }
  
  /**
   * 当游戏到达中午12点时触发
   */
  private onNoonArrived(): void {
    // 处理食物消耗
    const result = processNoonFoodConsumption(this.roles.value);
    
    // 更新上次消耗食物的日期
    this.lastFoodConsumptionDay.value = this.currentDay.value;
    
    // 发布食物消耗事件
    this.triggerEvent('foodConsumed', result);
    
    // 如果有角色处于饥饿状态，发布饥饿事件
    if (result.hungryCount > 0) {
      this.triggerEvent('hunger', result.hungryCount, result.fedCount);
    }
  }
  
  /**
   * 当游戏日期变化时触发
   */
  private onDayChanged(): void {
    // 触发日期变化事件
    this.triggerEvent('dayChanged', this.getCurrentDateString());
    
    // 恢复角色体力
    this.recoverRoleStamina();
  }
  
  /**
   * 恢复角色体力
   * 每天恢复一定体力
   */
  private recoverRoleStamina(): void {
    for (const role of this.roles.value) {
      // 每天恢复20点体力，但工作中的角色恢复较少
      const recoveryAmount = role.currentTaskId ? 10 : 20;
      
      // 更新体力值，不超过100
      role.workState.stamina = Math.min(100, role.workState.stamina + recoveryAmount);
      
      // 如果角色休息了，可以恢复一些效率
      if (!role.currentTaskId) {
        role.workState.efficiency = Math.min(120, role.workState.efficiency + 5);
        role.workState.lastRestTime = new Date();
      }
    }
  }
  
  /**
   * 推进游戏时间
   * @param hours 要推进的小时数
   */
  public advanceTime(hours: number): void {
    // 计算新的小时数
    let newHour = this.currentHour.value + hours;
    
    // 计算天数变化
    const daysToAdd = Math.floor(newHour / 24);
    newHour = newHour % 24;
    
    // 更新小时
    this.currentHour.value = newHour;
    
    // 如果天数有变化，更新日期
    if (daysToAdd > 0) {
      this.advanceDate(daysToAdd);
    }
  }
  
  /**
   * 推进游戏日期
   * @param days 要推进的天数
   */
  private advanceDate(days: number): void {
    // 计算新的日期
    let year = this.currentYear.value;
    let month = this.currentMonth.value;
    let day = this.currentDay.value + days;
    
    // 处理月份变更
    let daysInMonth;
    while (true) {
      // 获取当月天数
      daysInMonth = new Date(year, month, 0).getDate();
      
      // 如果日期超过当月天数，进入下一个月
      if (day > daysInMonth) {
        day -= daysInMonth;
        month++;
        
        // 如果月份超过12，进入下一年
        if (month > 12) {
          month = 1;
          year++;
        }
      } else {
        // 日期合法，停止循环
        break;
      }
    }
    
    // 更新日期
    this.currentYear.value = year;
    this.currentMonth.value = month;
    this.currentDay.value = day;
  }
  
  /**
   * 获取所有角色
   */
  public getRoles(): Role[] {
    return this.roles.value;
  }
  
  /**
   * 获取特定ID的角色
   * @param roleId 角色ID
   */
  public getRoleById(roleId: string | number): Role | undefined {
    const id = typeof roleId === 'number' ? roleId.toString() : roleId;
    return this.roles.value.find(role => role.id === id);
  }
  
  /**
   * 检查角色是否饥饿
   * @param roleId 角色ID
   */
  public isRoleHungry(roleId: string | number): boolean {
    return isHungry(roleId);
  }
  
  /**
   * 获取当前游戏年份
   */
  public getCurrentYear(): number {
    return this.currentYear.value;
  }
  
  /**
   * 获取当前游戏月份
   */
  public getCurrentMonth(): number {
    return this.currentMonth.value;
  }
  
  /**
   * 获取当前游戏日
   */
  public getCurrentDay(): number {
    return this.currentDay.value;
  }
  
  /**
   * 获取当前游戏小时
   */
  public getCurrentHour(): number {
    return this.currentHour.value;
  }
  
  /**
   * 设置当前游戏时间
   */
  public setTime(year: number, month: number, day: number, hour: number): void {
    this.currentYear.value = year;
    this.currentMonth.value = month;
    this.currentDay.value = day;
    this.currentHour.value = hour;
  }
  
  /**
   * 加载游戏状态
   * @param gameState 游戏状态数据
   */
  public loadGameState(gameState: any): void {
    // 更新时间
    this.currentYear.value = gameState.currentYear;
    this.currentMonth.value = gameState.currentMonth;
    this.currentDay.value = gameState.currentDay;
    this.currentHour.value = gameState.currentHour;
    
    // 更新上次食物消耗日期
    this.lastFoodConsumptionDay.value = gameState.lastFoodConsumptionDay;
    
    // 更新角色数据
    this.roles.value = gameState.roles;
    
    // 触发加载游戏事件
    this.triggerEvent('gameStateLoaded');
  }
  
  /**
   * 获取上次食物消耗的日期
   */
  public getLastFoodConsumptionDay(): number {
    return this.lastFoodConsumptionDay.value;
  }
}

// 导出单例游戏引擎实例
export const gameEngine = new GameEngine(10); 