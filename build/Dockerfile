#先执行assemble.sh
FROM node:latest
RUN mkdir -p /opt/ssr_with_hap/bin
COPY ./* /opt/ssr_with_hap/bin/
WORKDIR /opt/ssr_with_hap/bin/
RUN mkdir res &&\
	mv *.cfg res &&\
	npm install
ENV SUB_SSR_URL=FILL_IT
VOLUME /opt/ssr_with_hap/bin/res
ENTRYPOINT ["node","index.js"]