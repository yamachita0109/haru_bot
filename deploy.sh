#!/bin/sh
rm -fr release && mkdir release
zip -r app.zip index.js KuromojiWrapper.js node_modules > /dev/null 2>&1
mv app.zip release/

aws configure set aws_access_key_id $AWS_ACCESS_KEY_ID --profile $AWS_IAM_USER_NAME
aws configure set aws_secret_access_key $AWS_SECRET_ACCESS_KEY --profile $AWS_IAM_USER_NAME
aws configure set region $AWS_REGION --profile $AWS_IAM_USER_NAME

aws cloudformation package --template-file template.yml --s3-bucket $AWS_HARU_S3_BUCKET --s3-prefix `date '+%Y%m%d%H%M%S'` --output-template-file output.yml --profile $AWS_IAM_USER_NAME
aws cloudformation deploy --region $AWS_REGION --template-file output.yml --stack-name $AWS_HARU_STACK --profile $AWS_IAM_USER_NAME --capabilities CAPABILITY_IAM
