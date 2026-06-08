export async function genIndexContent() {
  const dataResponse = await fetch(`page-data/basic-data.json`);
  const data = await dataResponse.json();
  console.log(data);

  const sortedEntries = Object.entries(data).sort(([idA, itemA], [idB, itemB]) => {
    const pinA = Number(itemA.pinValue ?? 0);
    const pinB = Number(itemB.pinValue ?? 0);
    if (pinA !== pinB) {
      return pinB - pinA;
    }

    const dateA = itemA.date ?? "";
    const dateB = itemB.date ?? "";
    if (dateA !== dateB) {
      return dateB.localeCompare(dateA);
    }

    const titleA = itemA.title ?? "";
    const titleB = itemB.title ?? "";
    return titleA.localeCompare(titleB);
  });

  let list = "";
  for (const [id, item] of sortedEntries) {
    console.log(id);
    console.log(item);
    list += `<div style="margin-bottom: 8px;">
              <h3><a href="./?page=${id}" class="link-primary">${item.title}</a></h3>
              <div style="margin: 8px 0 8px 0">
                <p class="faded-text" style="margin: 0 0 0 0;"><i class="bi bi-pencil-fill"></i>&ensp;${item.author}&emsp;&emsp;<i class="bi bi-calendar-fill"></i>&ensp;${item.date}</p>
                <p class="faded-text" style="margin: 4px 0 0 0;">${item.description}</p>
              </div>
            </div>`;
  }
  let res = `<div class="responsive-row">
          <div class="box-left">这里是未来会上线的文章筛选功能。</div>
          <!-- <div class="box-right">C</div> -->
          <div class="box-rightenter">
            ${list}
          </div>
        </div>`

  return res;
}