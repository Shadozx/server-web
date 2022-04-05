const formatter = require('./api/helpers/formatter')
const { getInfo } = require('./api/helpers/parser')
const axios = require('axios').default
async function getFormatedPages(amount, url) {
  let urls = []
  for (let i = 1; i <= amount; i++) {
    urls.push(getInfo(url + i))
  }
  // [{}, {}, {}]
  const data = await Promise.all(urls)
  console.log(data.length)

  // Виконується якщо масив спарсений сторінок не пустий
  if (data.length) {
    // Перевірка чи не пусті сторінки
    data.forEach((val) => {
      if (val != null) console.log(val.size)
      else {
        console.log('Щось пішло не так...')
        throw new Error('Спарсена сторінка пуста!')
      }
    })

    let pages = []

    console.log('========================================')

    for (let page of data) {
      // '0' - продовження минулої сторінки

      // Виконується коли масив сторінок пустий а '0' єдине що є
      if (!pages.length && page.has('0')) {
        // Видаляється тому що це не потрібен текст
        page.delete('0')
      }

      // Виконується коли в масиві сторінки вже є глави і текст до них але в нас зараз є '0'
      if (pages.length && page.has('0')) {
        // З'єднання з минулою сторінкою
        pages[pages.length - 1].text = pages[pages.length - 1].text.concat(
          page.get('0')
        )
        page.delete('0')
      }

      // Виконується коли назва глави не дорівнює '0'
      if (!page.has('0')) {
        let length = pages.length
        let currentPage = !length ? 1 : length + 1

        for (let chapter of Array.from(page.keys())) {
          pages.push({
            title: chapter,
            text: page.get(chapter),
            num: currentPage,
          })
          currentPage++
        }
      }
      // Виконується якщо не вдалося спарсити сторінку
      if (page == null) {
        throw new Error('Текст сторінки пустий...')
      }
    }

    /**
     * title = '0'
     * title != '0'
     * title = null
     */

    // data.forEach(function (val, i) {
    //   if (!i) {
    //     if (val.has('0')) {
    //       val.delete('0')
    //     }

    //     let currentPage = !pages.length ? 1 : pages.length
    //     console.log('Current:', currentPage)
    //     let chapters = Array.from(val.keys())

    //     const length = chapters.length
    //     if (length > 0) {
    //       console.log('1')
    //       console.log(chapters)
    //       for (let key of chapters) {
    //         const page = { title: key, text: val.get(key), num: currentPage }

    //         pages.push(page)
    //         currentPage++
    //       }
    //     }
    //     // pages.push({title: })
    //   } else {
    //     if (val.has('0') && pages.length) {
    //       pages[pages.length - 1].text = pages[pages.length - 1].text.concat(
    //         val.get('0')
    //       )
    //       val.delete('0')
    //     } else if (val.has('0') && !pages.length) {
    //       val.delete('0')
    //     } else {
    //       let num = pages.length
    //       let currentPage = num ? num : 1
    //       console.log(currentPage)
    //       for (let key of val.keys()) {
    //         currentPage++
    //         pages.push({ title: key, text: val.get(key), num: currentPage })
    //       }
    //     }
    //   }
    // })
    // console.log(pages)
    return pages
  } else {
    console.log('Не вийшло спарсити фотографії...')
  }
}

// ;(async () => {
//   const data = await getFormatedPages(
//     175,
//     // 'http://loveread.ec/read_book.php?id=92417&p='
//     'http://loveread.ec/read_book.php?id=76991&p='
//   )
//   data.forEach(function (chapter) {
//     console.log(chapter.title, chapter.num)
//   })
//   //   console.log(data)
//   //   console.log(data)
// })()
axios.get('http://loveread.ec/view_global.php?id=92417').then((response) => {
  console.log(response)
})
