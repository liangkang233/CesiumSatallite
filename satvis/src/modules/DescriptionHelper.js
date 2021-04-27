import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
dayjs.extend(relativeTime);
export class DescriptionHelper {
  static renderDescription(time, name, position, passes, isGroundStation, tle) {
    let description = `
      <div class="ib">
        <h3>Position</h3>
        <table class="ibt">
          <thead>
            <tr>
              <th>Name</th>
              <th>Latitude</th>
              <th>Longitude</th>
              ${isGroundStation ? "" : "<th>Altitude</th>"}
              ${isGroundStation ? "" : "<th>Velocity</th>"}
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>${name}</td>
              <td>${position.latitude.toFixed(2)}&deg</td>
              <td>${position.longitude.toFixed(2)}&deg</td>
              ${isGroundStation ? "" : `<td>${(position.height / 1000).toFixed(2)} km</td>`}
              ${isGroundStation ? "" : `<td>${position.velocity.toFixed(2)} km/s</td>`}
            </tr>
          </tbody>
        </table>
        ${isGroundStation ? this.renderPasses():""}
        ${typeof tle === "undefined" ? "" : this.renderTLE(tle)}
      </div>
    `;
    return description;
  }

  static renderPasses() {
    let content=sessionStorage.getItem("content")
    if(content.length===0) return '';
    let data= JSON.parse(content)
    const list = Object.keys(data).map((item)=>{
      return data[item];
    });
    const html = `
        <h3>Signal</h3>
        <table class="ibt">
          <thead>
            <tr>
              <th>Src</th>
              <th>Dst</th>
              <th>Type</th>
              <th>Content</th>
            </tr>
          </thead>
          <tbody>
            ${list.map((item)=>{
              item=JSON.parse(item)
    return `
          <tr>
            <td>${item["src"]}</td>
            <td>${item["dst"]}</td>
            <td>${item["type"]}</td>
            <td>${item["contents"]}</td>
          </tr>
          `;
        })} 
          </tbody>
        </table>
      `;
    return html;
  }

  static renderTLE(tle) {
    const html = `
      <h3>TLE</h3>
      <div class="ib-code"><code>${tle.slice(1,3).join("\n")}</code></div>`;
    return html;
  }
}