# -*- coding: UTF-8 -*-
from bs4 import BeautifulSoup
import requests
import urllib
import time, os, sched
import MySQLdb
import sys

reload(sys)
sys.setdefaultencoding("utf-8")
schedule = sched.scheduler(time.time, time.sleep)
update_shiw_time = 10000
insert_show_time = 2000


def search_key():
    # 打开数据库连接
    db = MySQLdb.connect("vps.yining.site", "baymin", "baymin1024!@#$%", "free_fish", charset='utf8')
    # 使用cursor()方法获取操作游标
    cursor = db.cursor()
    # 使用execute方法执行SQL语句
    cursor.execute("SELECT `id`, `key`, `status` FROM appoint_key")
    # 使用 fetchone() 方法获取一条数据
    data = cursor.fetchall()
    # 关闭数据库连接
    db.close()
    return data


def insert_log(db, id, user_nick, appoint_key_id, url, title, price, location, desc, time, search_time):
    # 打开数据库连接
    # 使用cursor()方法获取操作游标
    cursor = db.cursor()
    cursor.execute("SELECT `id`, `appoint_key_id`, `url`, `title`, `price`, `now_price`, `remark`, `status_type`, `location`, `description`, `distance`, `search_time` FROM fishs WHERE id='%s'" % str(id))
    data = cursor.fetchone()
    if data:
        disparity = float(price) - float(data[5])
        all_disparity = float(price) - float(data[4])
        if disparity < 0:
            remark = "'降%s'" % str(all_disparity) # remark 这里需要注意字符串需要用''包住，下面sql语句没有直接设置''
            os.system("echo '\t\t%s' '%s'" % ("降价:￥" + price, title+" "+url))
            os.system("notify-send '%s' '%s' -t %d" % ("降价:￥" + price, title+" "+url, update_shiw_time))
            status = "2"
        elif disparity > 0:
            remark = "'涨%s'" % str(all_disparity)
            status = data[7]
        else:
            if data[6] is None:
                remark = 'null'
            else:
                remark = "'%s'" % data[6]
            status = data[7]
        sql = "UPDATE fishs SET \
            `appoint_key_id`='%s', `user_nick`='%s', `url`='%s', `title`='%s', `now_price`='%s', `location`='%s', \
            `description`='%s', `distance`='%s',`search_time`='%s', `remark`=%s, `status_type`='%s' \
            WHERE id='%s'" % (appoint_key_id, user_nick, url, title, price, location, desc, time, search_time, remark, status, id)
    else:
        sql = "INSERT INTO fishs(`id`, `user_nick`, `appoint_key_id`, `url`, `title`, `price`, `now_price`, `location`, `description`, `distance`, `search_time`, `create_time`) \
                          VALUES ('%s', '%s', '%s', '%s', '%s', '%s', '%s', '%s', '%s', '%s', '%s', '%s')" % \
              (id, user_nick, appoint_key_id, url, title, price, price, location, desc, time, search_time, search_time)
        os.system("echo '\t\t%s' '%s'" % ("新发布:￥" + price, title+" "+url))
        os.system("notify-send '%s' '%s' -t %d" % ("新发布:￥" + price, title + " " + url, insert_show_time))
    try:
        # 执行sql语句
        cursor.execute(sql)
        # 提交到数据库执行
        db.commit()
    except Exception, e:
        # 发生错误时回滚
        db.rollback()


def perform_command(cmd, inc):
    # 在inc秒后再次运行自己，即周期运行
    db = MySQLdb.connect("vps.yining.site", "baymin", "baymin1024!@#$%", "free_fish", charset='utf8')
    schedule.enter(inc, 0, perform_command, (cmd, inc))
    os.system(cmd)
    for i, item in enumerate(search_key()):
        os.system("echo '\t%s'查询：\n" % item[1])
        try:
            if item[2] == 1:
                # print "search key :", item[1]
                res = requests.get('https://s.2.taobao.com/list/?q=' +
                                   urllib.quote(str(item[1])) +
                                   '&st_edtime=1&search_type=item&_input_charset=utf8&page=1')  # 获取目标网页
                res.encoding = 'gbk'  # 抓取网页出现乱码
                # print(res.text)
                soup = BeautifulSoup(res.text, 'html.parser')  # 爬取网页
                page = soup.find(id="J_Pages")
                soup = soup.find(id="J_ItemListsContainer")
                for element in soup.find_all("div", class_="ks-waterfall"):
                    aa = element.find("div", class_="item-pic")

                    if aa is None:
                        continue
                    a = aa.a
                    user_nick = element.find("div", class_="seller-nick").a.string
                    url = "http:%s" % a.get('href')
                    id = url.split('?id=')[1]
                    title = a.get('title')
                    price = element.find("span", class_="price").em.string
                    location = element.find("div", class_="item-location").string
                    desc = element.find("div", class_="item-brief-desc").string
                    up_time = element.find("span", class_="item-pub-time").string
                    # (db, id, user_nick, appoint_key_id, url, title, price, location, desc, time, search_time):
                    insert_log(db, id, user_nick, item[0], url, title, price, location, desc, up_time, time.strftime("%Y-%m-%d %H:%M:%S", time.localtime()))
        except Exception, e:
            print(e.message)
    os.system("echo $(date) 本轮结束 '\n'--------------------------------'\n'")
    # 关闭数据库连接
    db.close()


def run(cmd, inc=20*60):
    schedule.enter(inc, 0, perform_command, (cmd, inc))
    schedule.run()
    # 持续运行，直到计划时间队列变成空为止
    # print('show time after 2 seconds:')


if __name__ == '__main__':
    run('echo $(date) 开始查询', 1)
