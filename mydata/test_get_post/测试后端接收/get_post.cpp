#include <stdio.h>
#include <errno.h>
#include <signal.h>
#include <stdlib.h>
#include <string.h>

#ifdef _WIN32
#include <winsock2.h>
#include <windows.h>
#pragma comment(lib, "ws2_32.lib")
#else
#include <sys/types.h>
#include <sys/socket.h>
#include <netinet/in.h>
#include <arpa/inet.h>
#include <unistd.h>
#include <sys/wait.h>
#include <sys/time.h>
#endif
 
#define PORT 5000
#define BUFSIZE 1024
// #define IPSTR "127.0.0.1" //服务器IP地址;
const char IPSTR[] = "10.16.43.47" ; //默认服务器IP地址;

int main(int argc, char **argv)
{
	int sockfd, i;
	struct sockaddr_in servaddr;
	char str1[4096], buf[BUFSIZE], *getlength;
	// socklen_t len;
	fd_set   t_set1;
	struct timeval  timeset;

#ifdef _WIN32
    WSADATA wsaData;
    if (WSAStartup(MAKEWORD(1, 1), &wsaData) != 0) {
        printf("Error initializing socket library\n");
        return -1;
    }
#endif 

	printf("\n运行程序命令行后可添加地址来设定连接主机IP地址\n");
	if ((sockfd = socket(AF_INET, SOCK_STREAM, 0)) < 0 ) {
		printf("创建网络连接失败,本进程即将终止---socket error!\n");
		exit(0);
	};
	// bzero(&servaddr, sizeof(servaddr));
    memset(&servaddr, 0, sizeof(servaddr));
	getlength=(char *)malloc(128);
#ifdef _WIN32
	servaddr.sin_family = AF_INET;
	if (argc != 2) {
		servaddr.sin_addr.s_addr = inet_addr(IPSTR);
		printf("与默认地址: %s 主机通信中\n", IPSTR);
	}
	else {
		servaddr.sin_addr.s_addr = inet_addr(argv[1]);
		printf("与地址: %s 主机通信中\n", argv[1]);
	}
	servaddr.sin_port = htons(PORT);
	memset(&servaddr.sin_zero, 0, 8);
#else
	servaddr.sin_family = AF_INET;
	servaddr.sin_port = htons(PORT);
	if (inet_pton(AF_INET, IPSTR, &servaddr.sin_addr) <= 0 ){
		printf("创建网络连接失败,本进程即将终止--inet_pton error!\n");
		exit(0);
	};
#endif
	if (connect(sockfd, (struct sockaddr *)&servaddr, sizeof(servaddr)) < 0){
		printf("连接到服务器失败,connect error!\n");
		exit(0);
	}
	printf("连接Flask服务器成功\n");
	printf("输入1发送get请求，输入其他数字发送post请求: ");
	while(scanf("%d", &i) != 1) 
		printf("输入参数错误，请重新输入\n");

	if(i == 1) {	/* 封装成http的get请求 */
		strcpy(str1, "GET /getsometing?mode=switch&snode=1&dnode=2 HTTP/1.1\r\n");
		strcat(str1, "Host: 127.0.0.1\r\n");		//cname记录不影响连接，此处不做修改
		strcat(str1, "Content-Type: text/html\r\n");
		// strcat(str1, "Content-Length: ");
		// strcpy(buf, "?mode=switch&snode=1&dnode=2");	
		// sprintf(getlength, "%d\r\n", strlen(buf));
		// strcat(str1, getlength);
		strcat(str1, "\r\n");
		printf("%s\n",str1);
		i = send(sockfd, str1, strlen(str1), 0);
		if (i < 0) {
			printf("发送失败！错误代码是%d，错误信息是'%s'\n",errno, strerror(errno));
			exit(0);
		}
		else {
			printf("消息发送成功，共发送了%d个字节！\n", i);
		}
	}
	else {			/* 封装成http的post请求 */
		strcpy(str1, "POST /postsometing HTTP/1.1\r\n");
		strcat(str1, "Host: 127.0.0.1\r\n");			//cname记录不影响连接，此处不做修改
		strcat(str1, "Content-Type: application/x-www-form-urlencoded\r\n");
		strcpy(buf, "mode=switch&snode=1&dnode=2");		//buf暂时存放post内容
		sprintf(getlength, "%d\r\n", strlen(buf));
		strcat(str1, "Content-Length: ");
		strcat(str1, getlength);
		strcat(str1, "\r\n");
		strcat(str1, buf);								
		printf("%s\n",str1);
		i = send(sockfd, str1, strlen(str1), 0);
		if (i < 0) {
			printf("发送失败！错误代码是%d，错误信息是'%s'\n",errno, strerror(errno));
			exit(0);
		}
		else {
			printf("消息发送成功，共发送了%d个字节！\n", i);
		}
	}

	FD_ZERO(&t_set1);
	FD_SET(sockfd, &t_set1);
	while(1){
			timeset.tv_sec= 0;
			timeset.tv_usec= 200;
			i= select(sockfd +1, &t_set1, NULL, NULL, &timeset);

			if (i == 0)
				continue;
			else if (i < 0) {
				#ifdef _WIN32
				closesocket(sockfd);
				WSACleanup();
				#else
				close(sockfd);
				#endif
				printf("在读取数据报文时SELECT检测到异常，该异常导致进程终止！\n");
				return -1;
			}
			else {
				memset(buf, 0, sizeof(buf) );
				i = recv(sockfd, buf, sizeof(buf), 0);
				if (i  <= 0) {
				        #ifdef _WIN32
				        closesocket(sockfd);
				        WSACleanup();
				        #else
				        close(sockfd);
				        #endif
						if (i == 0)
						{
							printf("读取数据报文结束\n");
				        	return 0;
						}
						else
						{
							printf("接收数据报出现错误！\n");
				        	return 0;
						}
				}
				else
				{
					printf("%s\n", buf);
					continue;
				}
			}
	}
#ifdef _WIN32
	closesocket(sockfd);
	WSACleanup();
#else
	close(sockfd);
#endif
	return 0;
}


/*			***flask后端测试用****
@app.route('/getsometing', methods=['GET'])
def gettest():
    mode = request.args.get('mode')
    snode = request.args.get('snode')
    dnode = request.args.get('dnode')
    print(f"get data: mode={mode},snode={snode},dnode={dnode}")
    return f"<html><body>get return: mode={mode},snode={snode},dnode={dnode}</body></html>"

@app.route('/postsometing', methods=['POST'])
def posttest():
    mode = request.form['mode']
    snode = request.form['snode']
    dnode = request.form['dnode']
    print(f"post data: mode={mode},snode={snode},dnode={dnode}")
    return f"<html><body>post return: mode={mode},snode={snode},dnode={dnode}</body></html>"
*/