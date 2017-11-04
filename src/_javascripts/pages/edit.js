import '../../_styles/pages/edit.scss'

$(function() {

    // 标题
    let $title = $('.article-title')
    // 摘要
    let $summary = $('.article-summary')
    // 类型
    let $typeRadioGroup = $('.article-type')
    let currentType = $typeRadioGroup.data('currentType')
    $typeRadioGroup.initRadio({
        labels: [
            {
                name: 'post',
                checked: currentType === 'post',
            },
            {
                name: 'product',
                checked: currentType === 'product',
            },
        ],
    })
    // 标签
    let $tagContainer = $('.article-tags')
    let tagsArr = []
    $tagContainer.children('.hidden').each(function() {
        tagsArr.push(this.innerHTML)
    })
    $tagContainer.initTag({
        tagGroupName: 'Tags',
        tagsArr,
        maxLengthEachTag: 12,
        maxTagCount: 2,
    })
    // 内容
    let $articleContent = $('.article-content')
    $articleContent.initRte({
        id: $articleContent.data('id'),
        contentToEdit: $articleContent.data('content'),
        maxLength: 5000,
        useRichText: false
    })
    let $editArea = $articleContent.find('.jm-edit-area')

    // 按钮
    let $submitButton = $('#submit')
    let $cancelButton = $('#cancel')
    $submitButton.click(function() {
        let $this = $(this)
        if (!$this.hasClass('_disabled')) {
            let dataObj = {
                _id: $articleContent.data('id'),
                title: $title.find('._input').val().trim(),
                summary: $summary.find('._input').val().trim(),
                content: $editArea.val(),
                tags: $tagContainer.data('tagsData'),
                type: $typeRadioGroup.find('[data-checked=true]').find('.text').text(),
            }
            $.ajax({
                contentType: 'application/json',
                url: '/saveArticle',
                type: 'Post',
                data: JSON.stringify(dataObj),
                success: function(result) {
                    console.log('--- save success --- \n', result)
                    switch (true) {
                        case result._id !== undefined:
                            // 保存成功
                            location.assign(`/articles/${result._id}`)
                            break
                        case result.unauthorized:
                            // 登录对话过期，保存失败
                            $.showJmDialog({
                                dialogType: 'alert',
                                title: 'Authentication expired.',
                                content: 'Please re-login.',
                                onConfirm() {
                                    location.reload()
                                }
                            })
                            break
                        case result.paramValidationFailed:
                            // 标题、内容等参数校验错误
                            $.showJmDialog({
                                dialogType: 'alert',
                                title: 'Parameter validation failed.',
                                content: 'Please check all input elements.',
                            })
                            break
                        default:
                            // 其它原因导致的保存失败
                            $.showJmDialog({
                                dialogType: 'alert',
                                title: 'Save article failed.',
                                content: 'An error occurred during saving. Please try agin later.'
                            })
                    }
                },
                fail: function(result) {
                    console.log('--- save fail --- \n', result)
                },
            })
        }
    })
    $cancelButton.click(function() {
        $.showJmDialog({
            dialogType: 'confirm',
            title: 'Leave this page?',
            content: 'Unsaved contents shall be discarded.',
            onConfirm() {
                window.history.go(-1)
            }
        })
    })

    // 值检查
    setInterval(function() {
        let titleValid = ($title.hasClass('non-empty') && !$title.hasClass('invalid'))
        let summaryValid = ($summary.hasClass('non-empty') && !$summary.hasClass('invalid'))
        let contentValid = /\S/.test($editArea.text() || $editArea.val())
        let tagsValid = ($tagContainer.data('tagsData')[0] !== undefined)
        let allValid = (titleValid && summaryValid && tagsValid && contentValid)
        $submitButton.toggleClass('_disabled', !allValid);
    }, 100)

    // 删除文章
    let $deleteButton = $('#delete')
    $deleteButton.click(function() {
        let dataObj = {
            _id: $articleContent.data('id')
        }
        $.showJmDialog({
            dialogType: 'confirm',
            title: 'Delete this article?',
            content: 'Deleted articles cannot be recovered.',
            onConfirm() {
                $.ajax({
                    contentType: 'application/json',
                    url: '/removeArticle',
                    type: 'Post',
                    data: JSON.stringify(dataObj),
                    success: function(removeResult) {
                        if (removeResult === true) {
                            location.assign('/')
                        } else {
                            $.showJmDialog({
                                dialogType: 'alert',
                                title: 'Save article failed.',
                                content: 'An error occurred during saving. Please try agin later.'
                            })
                        }
                    },
                })
            }
        })
    })

    // 编辑区高度动画
    if ($('html').is('#pc')) {
        setTimeout(function() {
            let editAreaOffset = $('.jm-footer').height() - $('.jm-nav').height() + 5
            // 内容编辑区动画
            $(document.documentElement).animate(
                {
                    scrollTop: 192
                },
                200,
                function() {
                    $editArea.animate(
                        {
                            minHeight: window.innerHeight - editAreaOffset
                        },
                        300,
                    )
                }
            )
        }, 400)
    } else {
        $editArea.css('minHeight', window.innerHeight - 150)
    }

})