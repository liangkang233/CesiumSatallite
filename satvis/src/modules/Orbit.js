
import * as satellitejs from "satellite.js";
import dayjs from "dayjs";

// 角度转弧度
const deg2rad = Math.PI / 180;
//const rad2deg = 180 / Math.PI;

// 写法参考 https://github.com/shashwatak/satellite-js
export default class Orbit {
  constructor(name, tle) {
    this.name = name;
    this.tle = tle.split("\n");
    // 初始化卫星记录
    this.satrec = satellitejs.twoline2satrec(this.tle[1], this.tle[2]);
  }

  get satnum() {
    // 卫星编号
    return this.satrec.satnum;
  }

  get orbitalPeriod() {
    // 平均运动弧度/每分钟。
    const meanMotionRad = this.satrec.no;
    // 周期
    const period = (2 * Math.PI) / meanMotionRad;
    return period;
  }

  positionECI(time) {
    // 使用JavaScript日期传播卫星 ECF计算地心惯性坐标系， 用于描述GPS卫星的位置信息，属于笛卡尔坐标系
    // 计算位置和速度
    return satellitejs.propagate(this.satrec, time).position;
  }

  positionECF(time) {
    // ECEF地心地球固连坐标系，用于描述地面接收器的位置信息，属于笛卡尔坐标系
    const positionEci = this.positionECI(time);
    const gmst = satellitejs.gstime(time);
    const positionEcf = satellitejs.eciToEcf(positionEci, gmst);
    return positionEcf;
  }

  positionGeodetic(time) {
    const positionEci = this.positionECI(time);
    const gmst = satellitejs.gstime(time);
    const positionGd = satellitejs.eciToGeodetic(positionEci, gmst);

    return {
      // longitude：经度 latitude：纬度
      longitude: positionGd.longitude,
      latitude: positionGd.latitude,
      height: positionGd.height * 1000,
    };
  }

  // 通过TLE和时间戳计算卫星的位置，高度，速度
  positionGeodeticWithVelocity(timestamp) {
    const positionAndVelocity = satellitejs.propagate(this.satrec, timestamp);
    const positionEci = positionAndVelocity.position;
    const velocityEci = positionAndVelocity.velocity;

    const gmst = satellitejs.gstime(timestamp);
    // ECI坐标转化为地理坐标
    const positionGd = satellitejs.eciToGeodetic(positionEci, gmst);

    const velocity = Math.sqrt(velocityEci.x * velocityEci.x +
      velocityEci.y * velocityEci.y +
      velocityEci.z * velocityEci.z);

    return {
      longitude: positionGd.longitude,
      latitude: positionGd.latitude,
      height: positionGd.height * 1000,
      velocity,
    };
  }

  // 计算地面监控站的经过信息
  computePassesElevation(groundStationPosition,
    startDate = dayjs().toDate(),
    endDate = dayjs(startDate).add(7, "day").toDate(),
    minElevation = 50,
    maxPasses = 20) {
    // 扩展运算符，把数组转为用逗号分隔的参数序列。es6语法.
    const groundStation = { ...groundStationPosition };
    groundStation.latitude *= deg2rad;
    groundStation.longitude *= deg2rad;
    groundStation.height /= 1000;

    const date = new Date(startDate);
    const passes = [];
    let pass = false;
    let ongoingPass = false;
    let lastElevation = 0;
    while (date < endDate) {
      const positionEcf = this.positionECF(date);
      const lookAngles = satellitejs.ecfToLookAngles(groundStation, positionEcf);
      const elevation = lookAngles.elevation / deg2rad;

      if (elevation >= 60 &&elevation <=75) {
        if (!ongoingPass) {
          // Start of new pass
          pass = {
            name: this.name,
            start: date.getTime(),
            // azimuth：方位角 elevation：海拔
            azimuthStart: lookAngles.azimuth,
            maxElevation: elevation,
            azimuthApex: lookAngles.azimuth,
          };
          ongoingPass = true;
        } else if (elevation > pass.maxElevation) {
          // Ongoing pass
          pass.maxElevation = elevation;
          pass.apex = date.getTime();
          pass.azimuthApex = lookAngles.azimuth;
        }
        date.setSeconds(date.getSeconds() + 1000);
      } else if (ongoingPass) {
        // End of pass
        if (pass.maxElevation > minElevation) {
          pass.end = date.getTime();
          pass.duration = pass.end - pass.start;
          pass.azimuthEnd = lookAngles.azimuth;
          pass.azimuthStart /= deg2rad;
          pass.azimuthApex /= deg2rad;
          pass.azimuthEnd /= deg2rad;
          passes.push(pass);
          if (passes.length > maxPasses) {
            break;
          }
        }
        ongoingPass = false;
        lastElevation = -180;
        date.setMinutes(date.getMinutes() + this.orbitalPeriod * 0.75);
      } else {
        const deltaElevation = elevation - lastElevation;
        lastElevation = elevation;
        if (deltaElevation < 0) {
          date.setMinutes(date.getMinutes() + this.orbitalPeriod * 0.75);
          lastElevation = -180;
        } else if (elevation < -20) {
          date.setMinutes(date.getMinutes() + 5);
        } else if (elevation < -5) {
          date.setMinutes(date.getMinutes() + 1);
        } else if (elevation < -1) {
          date.setSeconds(date.getSeconds() + 5);
        } else {
          date.setSeconds(date.getSeconds() + 2);
        }
      }
    }
    return passes;
  }
}
