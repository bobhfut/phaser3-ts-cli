# default
tdir="./templates/phaser3-typescript-webpack"
sdir="./templates_src/phaser3-typescript-webpack"
rm -rf ${tdir}
mkdir ${tdir}
tomove=('assets' 'src' 'tsconfig.json' 'webpack.config.js' 'webpack.production.config.js')
ejs=('README.md' 'package.json' '.gitignore')

## 直接复制
for item in ${tomove[@]}
do
  echo "copying ${item}.."
  rm -rf ${tdir}/${item}
  cp -rf ${sdir}/${item} ${tdir}/${item}
done
# 模板复制
for item in ${ejs[@]}
do
  echo "copying template ${item}.."
  rm -rf ${tdir}/${item} ${tdir}/${item}.ejs
  cp -rf ${sdir}/${item} ${tdir}/${item}.ejs
done
# 模板制作
sysOS=`uname -s`
if [ $sysOS == "Darwin" ];then
    sed -i '' 's/package-name-to-replace/<%=packageName%>/' ${tdir}/package.json.ejs
elif [  $sysOS == "Linux" ];then
    sed -i 's/package-name-to-replace/<%=packageName%>/' ${tdir}/package.json.ejs
else
    echo 'not support'
fi

echo default template done
