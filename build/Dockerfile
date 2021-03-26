FROM node:latest
RUN mkdir -p /opt/ssr_with_hap/bin
COPY ./* /opt/ssr_with_hap/bin/
WORKDIR /opt/ssr_with_hap/bin/
RUN mkdir res &&\
	mv *.cfg res &&\
	npm install

VOLUME
ENTRYPOINT ["node","index.js"]